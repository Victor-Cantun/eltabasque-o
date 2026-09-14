<?php

namespace App\Http\Controllers;

use App\Http\Requests\Sale\CancelSaleRequest;
use App\Http\Requests\Sale\StoreSaleRequest;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Mechanic;
use App\Models\PriceType;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleServiceItem;
use App\Services\SaleService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('slug', 'administrator')->exists();

        $userBranchIds = $user->branches()->pluck('branches.id')->toArray();
        if (empty($userBranchIds) && $user->primaryBranch()->first()) {
            $userBranchIds = [$user->primaryBranch()->first()->id];
        }

        $branchId = $request->input('branch_id');

        // Para vendedores (no admin con 1 sola sucursal), limitar la consulta únicamente a su sucursal asignada.
        // Si tiene múltiples sucursales asignadas (o es admin), permitir ver todas o filtrar entre sus sucursales.
        if (! $isAdmin && ! empty($userBranchIds)) {
            if (count($userBranchIds) === 1) {
                $branchId = (string) $userBranchIds[0];
            } elseif ($branchId && ! in_array((int) $branchId, $userBranchIds)) {
                $branchId = '';
            }
        }

        $status = $request->input('status');
        $search = $request->input('search');

        $today = Carbon::today()->toDateString();
        $hasDateFilter = $request->has('date_from') || $request->has('date_to');
        $dateFrom = $hasDateFilter ? $request->input('date_from') : $today;
        $dateTo = $hasDateFilter ? $request->input('date_to') : $today;

        $mechanicId = $request->input('mechanic_id');

        $baseQuery = Sale::query()
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when(! $isAdmin && ! empty($userBranchIds), fn ($q) => $q->whereIn('branch_id', $userBranchIds))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('folio', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($dateFrom, fn ($q) => $q->where('created_at', '>=', Carbon::parse($dateFrom)->startOfDay()))
            ->when($dateTo, fn ($q) => $q->where('created_at', '<=', Carbon::parse($dateTo)->endOfDay()))
            ->when($mechanicId, function ($q, $mechanicId) {
                $q->where(function ($sub) use ($mechanicId) {
                    $sub->whereHas('serviceItems', fn ($si) => $si->where('mechanic_id', $mechanicId))
                        ->orWhereHas('items', fn ($it) => $it->where('mechanic_id', $mechanicId));
                });
            });

        // Totales globales según filtros aplicados (solo completadas)
        $completedSummary = (clone $baseQuery)
            ->where('status', 'completed')
            ->selectRaw('
                COALESCE(SUM(total), 0) as total_revenue,
                COALESCE(SUM(products_total), 0) as total_products,
                COALESCE(SUM(service_total), 0) as total_services,
                COUNT(id) as completed_count
            ')
            ->first();

        // Resumen de servicios por mecánico en el periodo filtrado
        $mechanicsReport = SaleServiceItem::query()
            ->select([
                'sale_services.mechanic_id',
                'mechanics.name as mechanic_name',
                DB::raw('SUM(sale_services.quantity) as total_services_count'),
                DB::raw('SUM(sale_services.total) as total_services_revenue'),
            ])
            ->join('sales', 'sales.id', '=', 'sale_services.sale_id')
            ->join('mechanics', 'mechanics.id', '=', 'sale_services.mechanic_id')
            ->where('sales.status', 'completed')
            // ->where('sale_items.item_type', 'service')
            // ->whereNotNull('sale_items.mechanic_id')
            ->when($branchId, fn ($q) => $q->where('sales.branch_id', $branchId))
            ->when(! $isAdmin && ! empty($userBranchIds), fn ($q) => $q->whereIn('sales.branch_id', $userBranchIds))
            ->when($dateFrom, fn ($q) => $q->where('sales.created_at', '>=', Carbon::parse($dateFrom)->startOfDay()))
            ->when($dateTo, fn ($q) => $q->where('sales.created_at', '<=', Carbon::parse($dateTo)->endOfDay()))
            ->when($mechanicId, fn ($q) => $q->where('sale_services.mechanic_id', $mechanicId))
            ->groupBy('sale_services.mechanic_id', 'mechanics.name')
            ->orderByDesc('total_services_revenue')
            ->get();

        $sales = (clone $baseQuery)
            ->with([
                'branch:id,name,code',
                'user:id,name',
                // 'customer:id,name',
                'items.product:id,name,internal_code,original_code',
                'serviceItems.mechanic:id,name',
            ])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $branches = $isAdmin
            ? Branch::query()->where('active', true)->orderBy('name')->get(['id', 'name', 'code'])
            : Branch::query()->where('active', true)->whereIn('id', $userBranchIds)->orderBy('name')->get(['id', 'name', 'code']);

        $mechanics = Mechanic::query()
            ->where('active', true)
            ->with('branches:id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'branches' => $branches,
            'mechanics' => $mechanics,
            'isAdmin' => $isAdmin,
            'summary' => [
                'total_revenue' => (float) ($completedSummary?->total_revenue ?? 0),
                'total_products' => (float) ($completedSummary?->total_products ?? 0),
                'total_services' => (float) ($completedSummary?->total_services ?? 0),
                'completed_count' => (int) ($completedSummary?->completed_count ?? 0),
            ],
            'mechanicsReport' => $mechanicsReport,
            'filters' => [
                'branch_id' => $branchId ? (string) $branchId : '',
                'status' => $status,
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'mechanic_id' => $mechanicId ? (string) $mechanicId : '',
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        $branches = Branch::query()
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $defaultBranchId = $request->input('branch_id')
            ?? $user->primaryBranch()->first()?->id
            ?? $branches->first()?->id;

        $priceTypes = PriceType::query()
            ->where('active', true)
            ->orderBy('id', 'desc')
            // ->orderByRaw("FIELD(slug, 'public', 'mechanic', 'wholesale') asc")
            ->get(['id', 'name', 'slug', 'description']);

        $products = Product::query()
            ->where('active', true)
            ->with([
                // 'category:id,name',
                // 'brand:id,name',
                'prices.priceType:id,name,slug',
                'inventories',
            ])
            ->orderBy('name')
            ->get();

        // $customers = Customer::query()
        //    ->orderBy('name')
        //    ->get(['id', 'name', 'phone', 'email']);

        $mechanics = Mechanic::query()
            ->where('active', true)
            ->with('branches:id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('sales/create', [
            'branches' => $branches,
            'selectedBranchId' => (int) $defaultBranchId,
            'priceTypes' => $priceTypes,
            'products' => $products,
            // 'customers' => $customers,
            'mechanics' => $mechanics,
        ]);
    }

    public function store(StoreSaleRequest $request, SaleService $saleService): RedirectResponse
    {
        $sale = $saleService->createSale(
            $request->validated(),
            $request->user()
        );

        return redirect()
            ->route('sales.show', $sale)
            ->with('success', "Venta registrada exitosamente con Folio: {$sale->folio}");
    }

    public function show(Sale $sale): Response
    {
        $sale->load([
            'branch:id,name,code,address,phone',
            'user:id,name,email',
            // 'customer:id,name,phone,email,address',
            'cancelledBy:id,name',
            'items.product:id,name,internal_code,original_code',
            'items.priceType:id,name,slug',
            'serviceItems.mechanic:id,name',
            // 'items.mechanic:id,name',
            // 'items.priceType:id,name,slug',
        ]);

        return Inertia::render('sales/show', [
            'sale' => $sale,
        ]);
    }

    public function cancel(CancelSaleRequest $request, Sale $sale, SaleService $saleService): RedirectResponse
    {
        $saleService->cancelSale(
            $sale,
            $request->user(),
            $request->validated()['reason']
        );

        return redirect()
            ->route('sales.show', $sale)
            ->with('success', "Venta {$sale->folio} cancelada y stock restaurado en la sucursal.");
    }
}
