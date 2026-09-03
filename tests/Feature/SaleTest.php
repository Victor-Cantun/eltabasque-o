<?php

use App\Models\Branch;
use App\Models\Inventory;
use App\Models\InventoryMovement;
use App\Models\Mechanic;
use App\Models\Permission;
use App\Models\PriceType;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\Role;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Role administrator for full permissions
    $this->adminRole = Role::create([
        'name' => 'Administrador',
        'slug' => 'administrator',
    ]);

    $this->user = User::factory()->create();
    $this->user->roles()->attach($this->adminRole);

    // Sucursales
    $this->branch1 = Branch::create([
        'name' => 'Sucursal Escarcega',
        'code' => '24350',
        'address' => 'Av. Principal 123',
        'active' => true,
    ]);

    $this->branch2 = Branch::create([
        'name' => 'Sucursal Sabancuy',
        'code' => '24300',
        'address' => 'Calle Malecón 45',
        'active' => true,
    ]);

    // Tipos de precio
    $this->pricePublic = PriceType::create([
        'name' => 'Público',
        'slug' => 'public',
        'active' => true,
    ]);

    $this->priceMechanic = PriceType::create([
        'name' => 'Mecánico',
        'slug' => 'mechanic',
        'active' => true,
    ]);

    // Producto con precios
    $this->product = Product::create([
        'sku' => 'ACE-4T-001',
        'barcode' => '750123456789',
        'name' => 'Aceite 4T 20W50 1L',
        'cost' => 80.00,
        'active' => true,
    ]);

    ProductPrice::create([
        'product_id' => $this->product->id,
        'price_type_id' => $this->pricePublic->id,
        'price' => 120.00,
    ]);

    ProductPrice::create([
        'product_id' => $this->product->id,
        'price_type_id' => $this->priceMechanic->id,
        'price' => 100.00,
    ]);

    // Inventarios iniciales por sucursal
    Inventory::create([
        'branch_id' => $this->branch1->id,
        'product_id' => $this->product->id,
        'stock' => 10.00,
        'minimum_stock' => 2.00,
    ]);

    Inventory::create([
        'branch_id' => $this->branch2->id,
        'product_id' => $this->product->id,
        'stock' => 5.00,
        'minimum_stock' => 1.00,
    ]);
});

test('guests are redirected from sales pages', function () {
    $response = $this->get(route('sales.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can view sales index page', function () {
    $response = $this->actingAs($this->user)->get(route('sales.index'));
    $response->assertOk();
});

test('can view create sale POS screen with branches, price types and products', function () {
    $response = $this->actingAs($this->user)->get(route('sales.create'));
    $response->assertOk();
});

test('creates a sale, sets unit price from selected price_type, deducts stock from chosen branch and registers inventory movement', function () {
    $payload = [
        'branch_id' => $this->branch1->id,
        'sale_type' => 'retail',
        'discount' => 0,
        'tax' => 0,
        'items' => [
            [
                'product_id' => $this->product->id,
                'price_type_id' => $this->priceMechanic->id, // Precio Mecánico: $100
                'quantity' => 3,
                'unit_price' => 100.00,
                'discount' => 0,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->post(route('sales.store'), $payload);

    $sale = Sale::latest()->first();
    expect($sale)->not->toBeNull();
    $response->assertRedirect(route('sales.show', $sale));

    // Verificar datos de venta
    expect($sale->branch_id)->toBe($this->branch1->id);
    expect($sale->user_id)->toBe($this->user->id);
    expect((float) $sale->total)->toBe(300.00);
    expect($sale->status)->toBe('completed');

    // Verificar sale_item
    $item = $sale->items->first();
    expect($item->product_id)->toBe($this->product->id);
    expect($item->price_type_id)->toBe($this->priceMechanic->id);
    expect((float) $item->unit_price)->toBe(100.00);
    expect((float) $item->quantity)->toBe(3.00);

    // Verificar que el inventario de la sucursal 1 se redujo de 10 a 7
    $inv1 = Inventory::where('branch_id', $this->branch1->id)
        ->where('product_id', $this->product->id)
        ->first();
    expect((float) $inv1->stock)->toBe(7.00);

    // Verificar que el inventario de la sucursal 2 permanezca intacto en 5
    $inv2 = Inventory::where('branch_id', $this->branch2->id)
        ->where('product_id', $this->product->id)
        ->first();
    expect((float) $inv2->stock)->toBe(5.00);

    // Verificar registro de movimiento de inventario
    $movement = InventoryMovement::where('reference_id', $sale->id)
        ->where('reference_type', 'sale')
        ->first();
    expect($movement)->not->toBeNull();
    expect($movement->type)->toBe('sale');
    expect($movement->branch_id)->toBe($this->branch1->id);
    expect((float) $movement->quantity)->toBe(3.00);
    expect((float) $movement->stock_before)->toBe(10.00);
    expect((float) $movement->stock_after)->toBe(7.00);
});

test('prevents sale if quantity exceeds stock in selected branch', function () {
    $payload = [
        'branch_id' => $this->branch1->id,
        'items' => [
            [
                'product_id' => $this->product->id,
                'price_type_id' => $this->pricePublic->id,
                'quantity' => 15, // Stock es 10
                'unit_price' => 120.00,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->post(route('sales.store'), $payload);
    $response->assertSessionHasErrors(['items.0.quantity']);

    // Verificar que el stock no cambió
    $inv = Inventory::where('branch_id', $this->branch1->id)->first();
    expect((float) $inv->stock)->toBe(10.00);
});

test('cancels sale and restores branch stock', function () {
    // Primero hacer venta de 2 unidades en sucursal 2 (Stock inicial 5 -> 3)
    $sale = Sale::create([
        'folio' => 'VEN-02-TEST',
        'branch_id' => $this->branch2->id,
        'user_id' => $this->user->id,
        'subtotal' => 200.00,
        'total' => 200.00,
        'status' => 'completed',
    ]);

    $sale->items()->create([
        'product_id' => $this->product->id,
        'price_type_id' => $this->priceMechanic->id,
        'quantity' => 2.00,
        'unit_cost' => 80.00,
        'unit_price' => 100.00,
        'subtotal' => 200.00,
        'total' => 200.00,
    ]);

    // Simular que el stock está en 3
    Inventory::where('branch_id', $this->branch2->id)
        ->where('product_id', $this->product->id)
        ->update(['stock' => 3.00]);

    // Cancelar venta
    $response = $this->actingAs($this->user)->post(route('sales.cancel', $sale), [
        'reason' => 'Cliente canceló la compra',
    ]);

    $response->assertRedirect(route('sales.show', $sale));

    $sale->refresh();
    expect($sale->status)->toBe('cancelled');
    expect($sale->cancellation_reason)->toBe('Cliente canceló la compra');

    // Verificar que el stock de sucursal 2 volvió a 5
    $inv2 = Inventory::where('branch_id', $this->branch2->id)->first();
    expect((float) $inv2->stock)->toBe(5.00);
});

test('can add a service item to a sale alongside products without requiring stock deduction', function () {
    $payload = [
        'branch_id' => $this->branch1->id,
        'sale_type' => 'retail',
        'discount' => 0,
        'tax' => 0,
        'items' => [
            // Producto
            [
                'product_id' => $this->product->id,
                'price_type_id' => $this->pricePublic->id,
                'quantity' => 1,
                'unit_price' => 120.00,
            ],
            // Servicio (Mano de obra)
            [
                'product_id' => null,
                'description' => 'Mano de obra: Cambio de aceite',
                'quantity' => 1,
                'unit_price' => 150.00,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->post(route('sales.store'), $payload);

    $sale = Sale::latest()->first();
    expect($sale)->not->toBeNull();
    $response->assertRedirect(route('sales.show', $sale));

    // Total de venta: 120 (producto) + 150 (servicio) = 270
    expect((float) $sale->total)->toBe(270.00);
    expect($sale->items->count())->toBe(2);

    $serviceItem = $sale->items->whereNull('product_id')->first();
    expect($serviceItem)->not->toBeNull();
    expect($serviceItem->description)->toBe('Mano de obra: Cambio de aceite');
    expect((float) $serviceItem->unit_price)->toBe(150.00);

    // Verificar que el stock del producto disminuyó en 1 (de 10 a 9)
    $inv = Inventory::where('branch_id', $this->branch1->id)->first();
    expect((float) $inv->stock)->toBe(9.00);
});

test('non administrator seller is restricted to their assigned branch in sales index', function () {
    // Rol Vendedor con permiso sales.view
    $salesViewPerm = Permission::firstOrCreate(['slug' => 'sales.view'], ['name' => 'Ver Ventas']);
    $sellerRole = Role::create([
        'name' => 'Vendedor',
        'slug' => 'seller',
    ]);
    $sellerRole->permissions()->attach($salesViewPerm);

    $seller = User::factory()->create();
    $seller->roles()->attach($sellerRole);
    $seller->branches()->attach($this->branch2->id, ['is_primary' => true]);

    // Crear 1 venta en sucursal 1 y 1 venta en sucursal 2
    Sale::create([
        'folio' => 'VEN-01-ESC',
        'branch_id' => $this->branch1->id,
        'user_id' => $this->user->id,
        'subtotal' => 100,
        'total' => 100,
    ]);

    Sale::create([
        'folio' => 'VEN-02-SAB',
        'branch_id' => $this->branch2->id,
        'user_id' => $seller->id,
        'subtotal' => 200,
        'total' => 200,
    ]);

    // Vendedor consulta el historial: sólo debe ver ventas de la sucursal 2
    $response = $this->actingAs($seller)->get(route('sales.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('sales/index')
        ->has('sales.data', 1)
        ->where('sales.data.0.folio', 'VEN-02-SAB')
        ->where('isAdmin', false)
    );
});

test('can create a sale with only services assigned to a mechanic without any products', function () {
    $mechanic = Mechanic::create([
        'name' => 'Carlos Mecánico',
        'active' => true,
    ]);

    $payload = [
        'branch_id' => $this->branch1->id,
        'sale_type' => 'retail',
        'discount' => 0,
        'tax' => 0,
        'items' => [
            [
                'product_id' => null,
                'item_type' => 'service',
                'mechanic_id' => $mechanic->id,
                'description' => 'Afinación completa y cambio de balatas',
                'quantity' => 2,
                'unit_price' => 250.00,
                'discount' => 0,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->post(route('sales.store'), $payload);

    $sale = Sale::latest()->first();
    expect($sale)->not->toBeNull();
    $response->assertRedirect(route('sales.show', $sale));

    expect((float) $sale->total)->toBe(500.00);
    expect((float) $sale->service_total)->toBe(500.00);
    expect((float) $sale->products_total)->toBe(0.00);

    $item = $sale->items->first();
    expect($item->item_type)->toBe('service');
    expect($item->mechanic_id)->toBe($mechanic->id);
    expect($item->product_id)->toBeNull();
});

test('accurately calculates and separates products and services totals in mixed sale', function () {
    $mechanic = Mechanic::create([
        'name' => 'Pedro Taller',
        'active' => true,
    ]);

    $payload = [
        'branch_id' => $this->branch1->id,
        'sale_type' => 'retail',
        'discount' => 0,
        'tax' => 0,
        'items' => [
            // Producto / Refacción
            [
                'product_id' => $this->product->id,
                'item_type' => 'product',
                'price_type_id' => $this->pricePublic->id,
                'quantity' => 2,
                'unit_price' => 120.00, // Subtotal: 240
            ],
            // Servicio con mecánico
            [
                'product_id' => null,
                'item_type' => 'service',
                'mechanic_id' => $mechanic->id,
                'description' => 'Instalación de aceite y filtro',
                'quantity' => 1,
                'unit_price' => 100.00, // Subtotal: 100
            ],
        ],
    ];

    $this->actingAs($this->user)->post(route('sales.store'), $payload);

    $sale = Sale::latest()->first();
    expect($sale)->not->toBeNull();
    expect((float) $sale->products_total)->toBe(240.00);
    expect((float) $sale->service_total)->toBe(100.00);
    expect((float) $sale->total)->toBe(340.00);

    // Consultar reporte en index
    $response = $this->actingAs($this->user)->get(route('sales.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('sales/index')
        ->where('summary.total_products', 240)
        ->where('summary.total_services', 100)
        ->has('mechanicsReport', 1)
        ->where('mechanicsReport.0.mechanic_name', 'Pedro Taller')
        ->where('mechanicsReport.0.total_services_count', 1)
        ->where('mechanicsReport.0.total_services_revenue', 100)
    );
});

test('can register a new mechanic via endpoint', function () {
    $response = $this->actingAs($this->user)->postJson(route('mechanics.store'), [
        'name' => 'Roberto Gómez',
    ]);

    $response->assertCreated();
    $response->assertJsonPath('mechanic.name', 'Roberto Gómez');
    $this->assertDatabaseHas('mechanics', [
        'name' => 'Roberto Gómez',
        'active' => true,
    ]);
});
