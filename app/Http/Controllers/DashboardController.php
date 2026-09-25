<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleServiceItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Inventory;
class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $this->isAdmin($user);
        $userBranchIds = $this->userBranchIds($user);
        $today = Carbon::today()->toDateString();

        return Inertia::render('dashboard/index', [
            'branches' => $this->visibleBranches($isAdmin, $userBranchIds),
            'isAdmin' => $isAdmin,
            'filters' => [
                'date_from' => $request->input('date_from', $today),
                'date_to' => $request->input('date_to', $today),
            ],
        ]);
    }

    private function buildMechanicsReport(Collection $branchIds, ?string $dateFrom, ?string $dateTo, int $perBranchLimit = 5)
    {
        $rows = SaleServiceItem::query()
            ->select([
                'sales.branch_id',
                'sale_services.mechanic_id',
                'mechanics.name as mechanic_name',
            ])
            ->selectRaw('SUM(sale_services.quantity) as total_services_count, SUM(sale_services.total) as total_services_revenue')
            ->join('sales', 'sales.id', '=', 'sale_services.sale_id')
            ->join('mechanics', 'mechanics.id', '=', 'sale_services.mechanic_id')
            ->where('sales.status', 'completed')
            ->whereIn('sales.branch_id', $branchIds)
            // ->where('sale_items.item_type', 'service')
            // ->whereNotNull('sale_items.mechanic_id')
            ->whereIn('sales.branch_id', $branchIds)
            ->when($dateFrom, fn ($q) => $q->where('sales.created_at', '>=', Carbon::parse($dateFrom)->startOfDay()))
            ->when($dateTo, fn ($q) => $q->where('sales.created_at', '<=', Carbon::parse($dateTo)->endOfDay()))
            ->groupBy('sales.branch_id', 'sale_services.mechanic_id', 'mechanics.name')
            ->orderByDesc('total_services_revenue')
            ->get();

        // Agrupa por sucursal y recorta al top N por cada una (no un top N global)
        return $rows->groupBy('branch_id')
            ->map(fn ($group) => $group->take($perBranchLimit)->values());
    }

    private function buildTotalInventory( Collection $branchIds): Collection
    {
        return Inventory::query()
        ->join('products','products.id','=','inventories.product_id')
        ->join('branches', 'branches.id', '=', 'inventories.branch_id')
        ->whereIn('inventories.branch_id', $branchIds)
        ->select(
            'inventories.branch_id',
            'branches.name as branch_name',
            DB::raw('SUM(inventories.stock * products.cost) as total')
        )
        ->groupBy('inventories.branch_id','branches.name')
        ->get();
    }

    public function data(Request $request)
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $user = $request->user();
        $branches = $this->visibleBranches($this->isAdmin($user), $this->userBranchIds($user));
        $branchIds = $branches->pluck('id');
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        return response()->json([
            'branches_summary' => $this->buildBranchesSummary($branches, $branchIds, $dateFrom, $dateTo),
            'mechanics_report' => $this->buildMechanicsReport($branchIds, $dateFrom, $dateTo),
            'top_products' => $this->buildTopProducts($branchIds, $dateFrom, $dateTo),
            'low_stock_products' => $this->buildLowStockProducts($branchIds),
            
            'total_inventory' => $this->buildTotalInventory($branchIds),
        ]);
    }



    private function buildBranchesSummary(Collection $branches, Collection $branchIds, ?string $dateFrom, ?string $dateTo): Collection
    {
        $rows = Sale::query()
            ->select([
                'branch_id',
                DB::raw('COALESCE(SUM(products_total), 0) as parts_income'),
                DB::raw('COALESCE(SUM(service_total), 0) as service_income'),
                DB::raw('COALESCE(SUM(total), 0) as total_income'),
            ])
            ->where('status', 'completed')
            ->whereIn('branch_id', $branchIds)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay()))
            ->when($dateTo, fn ($q) => $q->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay()))
            ->groupBy('branch_id')
            ->get()
            ->keyBy('branch_id');

        return $branches->map(function (Branch $branch) use ($rows) {
            $row = $rows->get($branch->id);

            return [
                'branch_id' => $branch->id,
                'branch_name' => $branch->name,
                'parts_income' => (float) ($row->parts_income ?? 0),
                'service_income' => (float) ($row->service_income ?? 0),
                'total_income' => (float) ($row->total_income ?? 0),

            ];
        })->values();
    }

    private function buildTopProducts(Collection $branchIds, ?string $dateFrom, ?string $dateTo, int $perBranchLimit = 5)
    {
        $rows = SaleItem::query()
            ->select(['sales.branch_id', 'products.id', 'products.name', 'products.internal_code'])
            ->selectRaw('SUM(sale_items.quantity) as total_quantity, SUM(sale_items.total) as total_revenue')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->join('products', 'products.id', '=', 'sale_items.product_id')
            ->where('sales.status', 'completed')
            // ->where('sale_items.item_type', 'product')
            ->whereIn('sales.branch_id', $branchIds)
            ->when($dateFrom, fn ($q) => $q->where('sales.created_at', '>=', Carbon::parse($dateFrom)->startOfDay()))
            ->when($dateTo, fn ($q) => $q->where('sales.created_at', '<=', Carbon::parse($dateTo)->endOfDay()))
            ->groupBy('sales.branch_id', 'products.id', 'products.name', 'products.internal_code')
            ->orderByDesc('total_quantity')
            ->get();

        return $rows->groupBy('branch_id')
            ->map(fn ($group) => $group->take($perBranchLimit)->values());
    }

    private function buildLowStockProducts(Collection $branchIds, int $perBranchLimit = 10)
    {
        $rows = DB::table('inventories')
            ->join('products', 'products.id', '=', 'inventories.product_id')
            ->select([
                'inventories.branch_id',
                'products.id',
                'products.name',
                'products.internal_code',
                'inventories.stock',
                'inventories.minimum_stock',
            ])
            ->where('products.active', true)
            ->whereIn('inventories.branch_id', $branchIds)
            ->whereColumn('inventories.stock', '<=', 'inventories.minimum_stock')
            ->orderBy('inventories.stock')
            ->get();

        return $rows->groupBy('branch_id')
            ->map(fn ($group) => $group->take($perBranchLimit)->values());
    }

    private function buildIncomeTrend(Collection $branchIds, ?string $dateFrom, ?string $dateTo)
    {
        return Sale::query()
            ->selectRaw('DATE(created_at) as sale_date')
            ->selectRaw('COALESCE(SUM(products_total), 0) as parts_income')
            ->selectRaw('COALESCE(SUM(service_total), 0) as service_income')
            ->selectRaw('COALESCE(SUM(total), 0) as total_income')
            ->where('status', 'completed')
            ->whereIn('branch_id', $branchIds)
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay()))
            ->when($dateTo, fn ($q) => $q->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay()))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    // DashboardController.php

    public function incomeTrend(Request $request)
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $user = $request->user();
        $branches = $this->visibleBranches($this->isAdmin($user), $this->userBranchIds($user));
        $branchIds = $branches->pluck('id');

        return response()->json([
            'income_trend' => $this->buildIncomeTrend(
                $branchIds,
                $validated['date_from'] ?? null,
                $validated['date_to'] ?? null
            ),
        ]);
    }

    private function isAdmin($user): bool
    {
        return $user->roles()->where('slug', 'administrator')->exists();
    }

    private function userBranchIds($user): array
    {
        $ids = $user->branches()->pluck('branches.id')->toArray();
        if (empty($ids) && $user->primaryBranch()->first()) {
            $ids = [$user->primaryBranch()->first()->id];
        }

        return $ids;
    }

    private function visibleBranches(bool $isAdmin, array $userBranchIds): Collection
    {
        return Branch::query()
            ->where('active', true)
            ->when(! $isAdmin, fn ($q) => $q->whereIn('id', $userBranchIds))
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
    }
}
