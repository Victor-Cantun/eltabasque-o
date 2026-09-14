<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\MechanicController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductImportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard');
    Route::get('dashboard/data', [DashboardController::class, 'data'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard.data');
    Route::get('dashboard/income-trend', [DashboardController::class, 'incomeTrend'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard.income-trend');
    // Ventas
    Route::middleware(['permission:sales.view'])->group(function () {
        Route::get('sales', [SaleController::class, 'index'])
            ->name('sales.index');
        Route::get('sales/{sale}', [SaleController::class, 'show'])
            ->name('sales.show');
    });    
    Route::middleware(['permission:sales.create'])->group(function () {
        Route::get('sales/create', [SaleController::class, 'create'])
            ->name('sales.create');
        Route::post('sales', [SaleController::class, 'store'])
            ->name('sales.store');
    });
    Route::post('sales/{sale}/cancel', [SaleController::class, 'cancel'])
        ->middleware(['permission:sales.cancel'])
        ->name('sales.cancel');
    // Inventario
    Route::middleware('permission:inventory.view')->group(function () {
        Route::get('inventory', [InventoryController::class, 'index'])
            ->name('inventory.index');
        Route::get('inventory/{inventory}/edit', [InventoryController::class, 'edit'])
            ->name('inventory.edit');

    });
    Route::put('inventory/{inventory}', [InventoryController::class, 'update'])
        ->middleware('permission:inventory.edit-minimum-stock')
        ->name('inventory.update');
    // Exportar productos con bajo stock
    Route::get('inventory/export', [InventoryController::class, 'export'])
        ->name('inventory.export');     
    // Movimientos de inventario
    Route::get('/inventory-movements', [InventoryMovementController::class, 'index'])
        ->middleware(['permission:inventory-movements.view'])
        ->name('inventory-movements.index');
    Route::get('/inventory-movements/create', [InventoryMovementController::class, 'create'])
        ->middleware(['permission:inventory-movements.create'])
        ->name('inventory-movements.create');
    Route::post('/inventory-movements', [InventoryMovementController::class, 'store'])
        ->middleware(['permission:inventory-movements.create'])
        ->name('inventory-movements.store');
    //Sucursales
    Route::resource('branches', BranchController::class)
        ->middlewareFor('index', 'permission:branches.view')
        ->middlewareFor('create', 'permission:branches.create')
        ->middlewareFor('store', 'permission:branches.create')
        ->middlewareFor('edit', 'permission:branches.edit')
        ->middlewareFor('update', 'permission:branches.update')
        ->middlewareFor('destroy', 'permission:branches.delete');    
    Route::post('branches/{branch}/toggle-active', [BranchController::class, 'toggleActive'])
        ->middleware('permission:branches.edit')
        ->name('branches.toggle-active');
    //Mecánicos
    Route::resource('mechanics', MechanicController::class)
        ->middlewareFor('index', 'permission:mechanics.view')
        ->middlewareFor('create', 'permission:mechanics.create')
        ->middlewareFor('store', 'permission:mechanics.create')
        ->middlewareFor('edit', 'permission:mechanics.edit')
        ->middlewareFor('update', 'permission:mechanics.update')
        ->middlewareFor('destroy', 'permission:mechanics.delete');    
    Route::post('mechanics/{mechanic}/toggle-active', [MechanicController::class, 'toggleActive'])
        ->middleware('permission:mechanics.edit')
        ->name('mechanics.toggle-active');
    // Productos
    Route::resource('products', ProductController::class)
        ->middlewareFor('index', 'permission:products.view')
        ->middlewareFor('create', 'permission:products.create')
        ->middlewareFor('store', 'permission:products.create')
        ->middlewareFor('edit', 'permission:products.edit')
        ->middlewareFor('update', 'permission:products.update')
        ->middlewareFor('destroy', 'permission:products.delete');
    // Importar productos
    Route::get('products/import', [ProductImportController::class, 'create'])
        ->middleware('permission:products.create')
        ->name('products.import');
    Route::post('products/import', [ProductImportController::class, 'store'])
        ->middleware('permission:products.create')
        ->name('products.import.store');        
    // Usuarios
    Route::resource('users', UserController::class)
        ->middlewareFor('index', 'permission:users.view')
        ->middlewareFor('create', 'permission:users.create')
        ->middlewareFor('store', 'permission:users.create')
        ->middlewareFor('edit', 'permission:users.edit')
        ->middlewareFor('update', 'permission:users.update')
        ->middlewareFor('destroy', 'permission:users.delete');
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->middleware('permission:users.edit')
        ->name('users.toggle-status');        
    // Roles
    Route::resource('roles', RoleController::class)
        ->middlewareFor('index', 'permission:roles.view')
        ->middlewareFor('create', 'permission:roles.create')
        ->middlewareFor('store', 'permission:roles.create')
        ->middlewareFor('edit', 'permission:roles.edit')
        ->middlewareFor('update', 'permission:roles.update')
        ->middlewareFor('destroy', 'permission:roles.delete');
    // Permisos
    Route::resource('permissions', PermissionController::class)
        ->middlewareFor('index', 'permission:permissions.view')
        ->middlewareFor('create', 'permission:permissions.create')
        ->middlewareFor('store', 'permission:permissions.create')
        ->middlewareFor('edit', 'permission:permissions.edit')
        ->middlewareFor('update', 'permission:permissions.update')
        ->middlewareFor('destroy', 'permission:permissions.delete');
});

require __DIR__.'/settings.php';

// routes/web.php
