<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Supplier;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Services\SupplierService;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;

class SupplierController extends Controller
{
    public function __construct(private SupplierService $supplierService){}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $suppliers = Supplier::query()->get();
        return Inertia::render('suppliers/index',['suppliers'=>$suppliers,]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create():Response
    {
        return Inertia::render('suppliers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $this->supplierService->create($request->validated());
        return to_route('suppliers.index')
        ->with('success','Proveedor creado correctamente.');
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
    public function edit(Supplier $supplier):Response
    {
        return Inertia::render('suppliers/edit',['brach'=>$branch]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSupplierRequest $request, Supplier $supplier):RedirectResponse
    {
        $this->supplierService->update($supplier, $request->validate());
        return to_route('suppliers.index')
        ->with('success','Proveedor actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        return back()->with('error','Los proveedores no se pueden desactivar.');
    }
}
