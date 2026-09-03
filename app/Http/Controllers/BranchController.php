<?php

namespace App\Http\Controllers;

use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Models\Branch;
use App\Services\BranchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function __construct(private BranchService $branchService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $branches = Branch::query()
            ->withCount('users')

            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })

            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('branches/index', [
            'branches' => $branches,

            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('branches/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBranchRequest $request): RedirectResponse
    {
        $this->branchService->create($request->validated());

        return to_route('branches.index')->with('success', 'Sucursal creada correctamente');
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
    public function edit(Branch $branch): Response
    {
        // $branchModel = Branch::findOrFail($branch);
        return Inertia::render('branches/edit', ['branch' => $branch]);
        // dd($branch);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBranchRequest $request, Branch $branch): RedirectResponse
    {
        $this->branchService->update($branch, $request->validated());

        return to_route('branches.index')
            ->with('success', 'Sucursal actualizada correctamente.');
    }

    public function toggleActive(Branch $branch): RedirectResponse
    {
        $this->branchService->toggleActive($branch);

        return back()->with(
            'success',
            $branch->active
                ? 'Sucursal activada correctamente.'
                : 'Sucursal desactivada correctamente.'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Branch $branch): RedirectResponse
    {
        return back()->with(
            'error',
            'Las sucursales no se pueden eliminar. Puedes desactivarlas.'
        );
    }
}
