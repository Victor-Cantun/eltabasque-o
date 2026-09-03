<?php

namespace App\Http\Controllers;

use App\Http\Requests\InventoryMovement\StoreInventoryMovementRequest;
use App\Models\Branch;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryMovementController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService,
    ) {}

    public function index(): Response
    {
        $movements = InventoryMovement::query()
            ->with(['branch:id,name', 'product:id,name,sku', 'user:id,name'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('inventory-movements/index', [
            'movements' => $movements,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('slug', 'administrator')->exists();

        $userBranchIds = $user->branches()->pluck('branches.id')->toArray();
        if (empty($userBranchIds) && $user->primaryBranch()->first()) {
            $userBranchIds = [$user->primaryBranch()->first()->id];
        }

        $branches = $isAdmin
            ? Branch::query()->select('id', 'name')->orderBy('name')->get()
            : Branch::query()->whereIn('id', $userBranchIds)->select('id', 'name')->orderBy('name')->get();

        $defaultBranchId = ! $isAdmin && ! empty($userBranchIds) ? $userBranchIds[0] : null;

        return Inertia::render('inventory-movements/create', [
            'branches' => $branches,
            'isAdmin' => $isAdmin,
            'defaultBranchId' => $defaultBranchId,

            'products' => Product::query()
                ->where('active', true)
                ->select('id', 'name', 'sku', 'barcode')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreInventoryMovementRequest $request): RedirectResponse
    {
        $this->inventoryService->registerMovement(
            $request->validated()
        );

        return to_route('inventory-movements.index')
            ->with('success', 'Movimiento registrado correctamente.');
    }
}
