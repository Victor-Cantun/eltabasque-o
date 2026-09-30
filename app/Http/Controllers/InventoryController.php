<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventory\UpdateInventoryRequest;
use App\Models\Branch;
use App\Models\Inventory;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('slug', 'administrator')->exists();

        $userBranchIds = $user->branches()->pluck('branches.id')->toArray();
        if (empty($userBranchIds) && $user->primaryBranch()->first()) {
            $userBranchIds = [$user->primaryBranch()->first()->id];
        }

        $search = $request->input('search');
        $branchId = $request->input('branch_id');
        $minStock = $request->input('min_stock');

        if (! $isAdmin && ! empty($userBranchIds)) {
            if (! $branchId || ! in_array((int) $branchId, $userBranchIds)) {
                $branchId = (string) $userBranchIds[0];
            }
        }

        $inventories = $this->filteredQuery($request, $isAdmin, $userBranchIds, $branchId, $search, $minStock)
            ->orderBy('stock')
            ->paginate(20)
            ->withQueryString();

        $branches = $isAdmin
            ? Branch::query()->orderBy('name')->get(['id', 'name'])
            : Branch::query()->whereIn('id', $userBranchIds)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('inventory/index', [
            'inventories' => $inventories,
            'branches' => $branches,
            'isAdmin' => $isAdmin,
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId ? (string) $branchId : '',
                'min_stock' => $minStock !== null && $minStock !== '' ? (string) $minStock : '',
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('slug', 'administrator')->exists();

        $userBranchIds = $user->branches()->pluck('branches.id')->toArray();
        if (empty($userBranchIds) && $user->primaryBranch()->first()) {
            $userBranchIds = [$user->primaryBranch()->first()->id];
        }

        $search = $request->input('search');
        $branchId = $request->input('branch_id');
        $minStock = $request->input('min_stock');

        if (! $isAdmin && ! empty($userBranchIds)) {
            if (! $branchId || ! in_array((int) $branchId, $userBranchIds)) {
                $branchId = (string) $userBranchIds[0];
            }
        }

        $inventories = $this->filteredQuery($request, $isAdmin, $userBranchIds, $branchId, $search, $minStock)
            ->orderBy('stock')
            ->get();

        $filename = 'inventario_'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($inventories) {
            $handle = fopen('php://output', 'w');

            // BOM para que Excel abra bien los acentos
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['Sucursal', 'Producto', 'Código interno', 'Código original', 'Stock', 'Stock mínimo']);

            foreach ($inventories as $row) {
                fputcsv($handle, [
                    $row->branch->name,
                    $row->product->name,
                    $row->product->internal_code,
                    $row->product->original_code,
                    $row->stock,
                    $row->minimum_stock,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function edit(Inventory $inventory): Response
    {
        return Inertia::render('inventory/edit', [
            'inventory' => $inventory->load(['branch:id,name', 'product:id,name,internal_code,original_code']),
        ]);
    }

    public function update(UpdateInventoryRequest $request, Inventory $inventory): RedirectResponse
    {
        $this->inventoryService->updateMinimumStock(
            $inventory,
            $request->validated()
        );

        return to_route('inventory.index')
            ->with('success', 'Stock mínimo actualizado correctamente.');
    }

    private function filteredQuery(
        Request $request,
        bool $isAdmin,
        array $userBranchIds,
        ?string $branchId,
        ?string $search,
        ?string $minStock,
    ) {
        return Inventory::query()
            ->with(['branch:id,name', 'product:id,name,internal_code,original_code'])
            ->when(
                $request->filled('low_stock'),
                fn ($query) => $query->whereColumn('stock', '<=', 'minimum_stock'),
            )
            ->when(
                $minStock !== null && $minStock !== '',
                fn ($query) => $query->where('stock', '<=', (float) $minStock),
            )
            ->when($search, function ($query, $search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where(function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%")
                            ->orWhere('internal_code', 'like', "%{$search}%")
                            ->orWhere('original_code', 'like', "%{$search}%");
                    });
                });
            })
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->when(! $isAdmin && ! empty($userBranchIds), fn ($query) => $query->whereIn('branch_id', $userBranchIds));
    }
}
