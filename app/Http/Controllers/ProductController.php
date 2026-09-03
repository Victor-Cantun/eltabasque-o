<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Branch;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\PriceType;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('slug', 'administrator')->exists();

        $userBranchIds = $user->branches()->pluck('branches.id')->toArray();
        if (empty($userBranchIds) && $user->primaryBranch()->first()) {
            $userBranchIds = [$user->primaryBranch()->first()->id];
        }

        $search = $request->input('search');
        $active = $request->input('active');
        $branchId = $request->input('branch_id');
         // Vendedor: forzado a su sucursal
        // Non-admins can only see their assigned branch
        if (! $isAdmin && ! empty($userBranchIds)) {
            if (! $branchId || ! in_array((int) $branchId, $userBranchIds)) {
                $branchId = (string) $userBranchIds[0];
            }
        }

        $products = Product::query()
        ->select([
            'id', 'internal_code', 'original_code', 'name',
            'description', 'image', 'cost', 'active', 'created_at',
        ])
        ->with(['prices.priceType'])
        ->withSum(['inventories as stock' => function ($query) use ($branchId, $isAdmin, $userBranchIds) {
            if ($branchId) {
                $query->where('branch_id', $branchId);
            } elseif (! $isAdmin) {
                $query->whereIn('branch_id', $userBranchIds);
            }
            // admin sin branchId => suma stock de TODAS las sucursales
        }], 'stock')
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('internal_code', 'like', "%{$search}%")
                    ->orWhere('original_code', 'like', "%{$search}%");
            });
        })
        ->when($active !== null && $active !== '', function ($query) use ($active) {
            $query->where('active', (bool) $active);
        })
        ->orderBy('stock')
        ->paginate(20)
        ->withQueryString();


        $branches = $isAdmin
            ? Branch::query()->orderBy('name')->get(['id', 'name'])
            : Branch::query()->whereIn('id', $userBranchIds)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('products/index', [
            //'inventories' => $inventories,
            'products' => $products,
            'branches' => $branches,
            'isAdmin' => $isAdmin,
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId ? (string) $branchId : '',
                'active' => $active,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render(
            'products/create',
            [
                'categories' => Category::query()
                    ->orderBy('name')
                    ->get(['id', 'name']),

                'brands' => Brand::query()
                    ->orderBy('name')
                    ->get(['id', 'name']),

                'priceTypes' => PriceType::query()
                    ->where('active', true)
                    ->orderBy('id')
                    ->get(['id', 'name', 'slug']),
            ]
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request, ProductService $productService): RedirectResponse
    {
        $productService->create(
            $request->validated()
        );

        return redirect()
            ->route('products.index')
            ->with(
                'success',
                'Producto creado correctamente.'
            );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product): Response
    {
        $product->load(['category', 'brand', 'prices.priceType']);

        return Inertia::render(
            'products/edit',
            [
                'product' => $product,

                'categories' => Category::query()
                    ->orderBy('name')
                    ->get(['id', 'name']),

                'brands' => Brand::query()
                    ->orderBy('name')
                    ->get(['id', 'name']),

                'priceTypes' => PriceType::query()
                    ->where('active', true)
                    ->orderBy('id')
                    ->get(['id', 'name', 'slug']),
            ]
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request,
        Product $product,
        ProductService $productService)
    {
        $productService->update(
            $product,
            $request->validated()
        );

        return redirect()
            ->route('products.index')
            ->with(
                'success',
                'Producto actualizado correctamente.'
            );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product->delete();

        return redirect()
            ->route('products.index')
            ->with(
                'success',
                'Producto eliminado correctamente.'
            );
    }
}
