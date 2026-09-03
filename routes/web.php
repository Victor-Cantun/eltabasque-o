<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\MechanicController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ProductImportController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::post('branches/{branch}/toggle-active', [BranchController::class, 'toggleActive'])->name('branches.toggle-active');
    Route::post('mechanics/{mechanic}/toggle-active', [MechanicController::class, 'toggleActive'])->name('mechanics.toggle-active');

    // routes/web.php
    Route::get('products/import', [ProductImportController::class, 'create'])->name('products.import');
    Route::post('products/import', [ProductImportController::class, 'store'])->name('products.import.store');
    // routes/web.php
    Route::get('inventory/export', [InventoryController::class, 'export'])->name('inventory.export');
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
    ->name('users.toggle-status');
    Route::resource('branches', BranchController::class)
        ->middlewareFor('index', 'permission:branches.view')
        ->middlewareFor('create', 'permission:branches.create')
        ->middlewareFor('store', 'permission:branches.create')
        ->middlewareFor('edit', 'permission:branches.edit')
        ->middlewareFor('update', 'permission:branches.update')
        ->middlewareFor('destroy', 'permission:branches.delete');    
    Route::resource('mechanics', MechanicController::class)
        ->middlewareFor('index', 'permission:mechanics.view')
        ->middlewareFor('create', 'permission:mechanics.create')
        ->middlewareFor('store', 'permission:mechanics.create')
        ->middlewareFor('edit', 'permission:mechanics.edit')
        ->middlewareFor('update', 'permission:mechanics.update')
        ->middlewareFor('destroy', 'permission:mechanics.delete');    
    Route::resource('products', ProductController::class)
        ->middlewareFor('index', 'permission:products.view')
        ->middlewareFor('create', 'permission:products.create')
        ->middlewareFor('store', 'permission:products.create')
        ->middlewareFor('edit', 'permission:products.edit')
        ->middlewareFor('update', 'permission:products.update')
        ->middlewareFor('destroy', 'permission:products.delete');
    Route::resource('users', UserController::class)
        ->middlewareFor('index', 'permission:users.view')
        ->middlewareFor('create', 'permission:users.create')
        ->middlewareFor('store', 'permission:users.create')
        ->middlewareFor('edit', 'permission:users.edit')
        ->middlewareFor('update', 'permission:users.update')
        ->middlewareFor('destroy', 'permission:users.delete');    
    Route::resource('roles', RoleController::class)
        ->middlewareFor('index', 'permission:roles.view')
        ->middlewareFor('create', 'permission:roles.create')
        ->middlewareFor('store', 'permission:roles.create')
        ->middlewareFor('edit', 'permission:roles.edit')
        ->middlewareFor('update', 'permission:roles.update')
        ->middlewareFor('destroy', 'permission:roles.delete');    
    Route::resource('permissions', PermissionController::class)
        ->middlewareFor('index', 'permission:permissions.view')
        ->middlewareFor('create', 'permission:permissions.create')
        ->middlewareFor('store', 'permission:permissions.create')
        ->middlewareFor('edit', 'permission:permissions.edit')
        ->middlewareFor('update', 'permission:permissions.update')
        ->middlewareFor('destroy', 'permission:permissions.delete');    
    Route::middleware(['auth', 'permission:inventory.view'])->group(function () {
        Route::get('/inventory', [InventoryController::class, 'index'])
            ->name('inventory.index');
        Route::get('/inventory/{inventory}/edit', [InventoryController::class, 'edit'])
            ->name('inventory.edit');
        Route::put('/inventory/{inventory}', [InventoryController::class, 'update'])
            ->middleware('permission:inventory.edit-minimum-stock')
            ->name('inventory.update');
    });
    Route::middleware(['auth', 'permission:inventory-movements.view'])->group(function () {
        Route::get('/inventory-movements', [InventoryMovementController::class, 'index'])
            ->name('inventory-movements.index');
    });
    Route::middleware(['auth', 'permission:inventory-movements.create'])->group(function () {
        Route::get('/inventory-movements/create', [InventoryMovementController::class, 'create'])
            ->name('inventory-movements.create');
        Route::post('/inventory-movements', [InventoryMovementController::class, 'store'])
            ->name('inventory-movements.store');
    });
    Route::middleware(['auth', 'permission:sales.create'])->group(function () {
        Route::get('/sales/create', [SaleController::class, 'create'])->name('sales.create');
        Route::post('/sales', [SaleController::class, 'store'])->name('sales.store');
    });
    Route::middleware(['auth', 'permission:sales.view'])->group(function () {
        Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
        Route::get('/sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    });
    Route::middleware(['auth', 'permission:sales.cancel'])->group(function () {
        Route::post('/sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');
    });
});

require __DIR__.'/settings.php';

// routes/web.php
