<?php

use App\Models\Branch;
use App\Models\Inventory;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::create([
        'name' => 'Administrador',
        'slug' => 'administrator',
    ]);

    $permission = Permission::create([
        'name' => 'Ver inventario',
        'slug' => 'inventory.view',
        'module' => 'inventory',
    ]);

    $this->adminRole->permissions()->attach($permission);

    $this->user = User::factory()->create();
    $this->user->roles()->attach($this->adminRole);

    $this->branch = Branch::create([
        'name' => 'Sucursal Principal',
        'code' => 'PRINCIPAL',
        'address' => 'Calle 1 #100',
        'active' => true,
    ]);

    $this->user->branches()->attach($this->branch->id, ['is_primary' => true]);

    $this->product1 = Product::create([
        'name' => 'Aceite Sintetico 5W30',
        'internal_code' => 'INT-ACEITE-01',
        'original_code' => 'ORIG-SYN-001',
        'cost' => 150.00,
        'active' => true,
    ]);

    $this->product2 = Product::create([
        'name' => 'Filtro de Aire',
        'internal_code' => 'INT-FILTRO-02',
        'original_code' => 'ORIG-AIR-002',
        'cost' => 80.00,
        'active' => true,
    ]);

    $this->product3 = Product::create([
        'name' => 'Bujia Iridium',
        'internal_code' => 'INT-BUJIA-03',
        'original_code' => 'ORIG-SPARK-003',
        'cost' => 120.00,
        'active' => true,
    ]);

    $this->inv1 = Inventory::create([
        'branch_id' => $this->branch->id,
        'product_id' => $this->product1->id,
        'stock' => 10,
        'minimum_stock' => 2,
    ]);

    $this->inv2 = Inventory::create([
        'branch_id' => $this->branch->id,
        'product_id' => $this->product2->id,
        'stock' => 15,
        'minimum_stock' => 3,
    ]);

    $this->inv3 = Inventory::create([
        'branch_id' => $this->branch->id,
        'product_id' => $this->product3->id,
        'stock' => 20,
        'minimum_stock' => 5,
    ]);
});

test('can search inventory by product name', function () {
    $response = $this->actingAs($this->user)->get(route('inventory.index', [
        'search' => 'Aceite',
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('inventory/index')
        ->has('inventories.data', 1)
        ->where('inventories.data.0.product.name', 'Aceite Sintetico 5W30')
        ->where('inventories.data.0.product.internal_code', 'INT-ACEITE-01')
        ->where('inventories.data.0.product.original_code', 'ORIG-SYN-001')
    );
});

test('can search inventory by internal_code', function () {
    $response = $this->actingAs($this->user)->get(route('inventory.index', [
        'search' => 'FILTRO-02',
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('inventory/index')
        ->has('inventories.data', 1)
        ->where('inventories.data.0.product.name', 'Filtro de Aire')
        ->where('inventories.data.0.product.internal_code', 'INT-FILTRO-02')
    );
});

test('can search inventory by original_code', function () {
    $response = $this->actingAs($this->user)->get(route('inventory.index', [
        'search' => 'SPARK-003',
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('inventory/index')
        ->has('inventories.data', 1)
        ->where('inventories.data.0.product.name', 'Bujia Iridium')
        ->where('inventories.data.0.product.original_code', 'ORIG-SPARK-003')
    );
});

test('export includes internal_code and original_code with search filter', function () {
    $response = $this->actingAs($this->user)->get(route('inventory.export', [
        'search' => 'FILTRO-02',
    ]));

    $response->assertOk();
    $content = $response->streamedContent();

    expect($content)->toContain('Código interno');
    expect($content)->toContain('Código original');
    expect($content)->toContain('INT-FILTRO-02');
    expect($content)->toContain('ORIG-AIR-002');
    expect($content)->not()->toContain('INT-ACEITE-01');
});
