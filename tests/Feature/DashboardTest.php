<?php

use App\Models\Branch;
use App\Models\Inventory;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::create([
        'name' => 'Administrador',
        'slug' => 'administrator',
    ]);

    $permission = Permission::create([
        'name' => 'Ver dashboard',
        'slug' => 'dashboard.view',
        'module' => 'dashboard',
    ]);

    $this->adminRole->permissions()->attach($permission);

    $this->user = User::factory()->create();
    $this->user->roles()->attach($this->adminRole);

    $this->branch1 = Branch::create([
        'name' => 'Sucursal Norte',
        'code' => 'NORTE',
        'address' => 'Av. Norte 100',
        'active' => true,
    ]);

    $this->branch2 = Branch::create([
        'name' => 'Sucursal Sur',
        'code' => 'SUR',
        'address' => 'Av. Sur 200',
        'active' => true,
    ]);

    $this->user->branches()->attach($this->branch1->id, ['is_primary' => true]);
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $response = $this->actingAs($this->user)->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard data returns total_inventory per branch calculated from stock and product cost', function () {
    $product1 = Product::create([
        'name' => 'Aceite 10W40',
        'internal_code' => 'ACE-10',
        'cost' => 100.50,
        'active' => true,
    ]);

    $product2 = Product::create([
        'name' => 'Filtro Gasolina',
        'internal_code' => 'FIL-GAS',
        'cost' => 50.00,
        'active' => true,
    ]);

    // Branch 1: (10 * 100.50) + (5 * 50.00) = 1005.00 + 250.00 = 1255.00
    Inventory::create([
        'branch_id' => $this->branch1->id,
        'product_id' => $product1->id,
        'stock' => 10,
        'minimum_stock' => 2,
    ]);
    Inventory::create([
        'branch_id' => $this->branch1->id,
        'product_id' => $product2->id,
        'stock' => 5,
        'minimum_stock' => 1,
    ]);

    // Branch 2: No inventory records (total should be 0.00)

    $response = $this->actingAs($this->user)->getJson(route('dashboard.data'));

    $response->assertOk();
    $response->assertJsonStructure([
        'branches_summary',
        'mechanics_report',
        'top_products',
        'low_stock_products',
        'total_inventory' => [
            '*' => ['branch_id', 'branch_name', 'total'],
        ],
    ]);

    $totalInventory = collect($response->json('total_inventory'));

    $branch1Data = $totalInventory->firstWhere('branch_id', $this->branch1->id);
    expect($branch1Data)->not()->toBeNull()
        ->and($branch1Data['total'])->toEqual(1255.0);

    $branch2Data = $totalInventory->firstWhere('branch_id', $this->branch2->id);
    expect($branch2Data)->not()->toBeNull()
        ->and($branch2Data['total'])->toEqual(0.0);
});
