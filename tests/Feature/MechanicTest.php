<?php

use App\Models\Branch;
use App\Models\Mechanic;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::create([
        'name' => 'Administrador',
        'slug' => 'administrator',
    ]);

    // Permissions for mechanics
    $permissions = [
        Permission::create(['name' => 'Ver mecánicos', 'slug' => 'mechanics.view', 'module' => 'mechanics']),
        Permission::create(['name' => 'Crear mecánicos', 'slug' => 'mechanics.create', 'module' => 'mechanics']),
        Permission::create(['name' => 'Editar mecánicos', 'slug' => 'mechanics.edit', 'module' => 'mechanics']),
        Permission::create(['name' => 'Actualizar mecánicos', 'slug' => 'mechanics.update', 'module' => 'mechanics']),
        Permission::create(['name' => 'Eliminar mecánicos', 'slug' => 'mechanics.delete', 'module' => 'mechanics']),
    ];

    $this->adminRole->permissions()->sync(collect($permissions)->pluck('id'));

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
});

test('can view mechanics list', function () {
    $mechanic = Mechanic::create([
        'name' => 'Carlos Mendoza',
        'address' => 'Calle 5 #10',
        'phone' => '9821112233',
        'email' => 'carlos@example.com',
        'active' => true,
    ]);
    $mechanic->branches()->attach($this->branch1->id, ['is_primary' => true]);

    $response = $this->actingAs($this->user)->get(route('mechanics.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('mechanics/index')
        ->has('mechanics.data', 1)
        ->where('mechanics.data.0.name', 'Carlos Mendoza')
        ->where('mechanics.data.0.branches.0.name', 'Sucursal Norte')
    );
});

test('can render create mechanic page with branches', function () {
    $response = $this->actingAs($this->user)->get(route('mechanics.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('mechanics/create')
        ->has('branches', 2)
    );
});

test('can create a mechanic with contact fields and assigned branches', function () {
    $response = $this->actingAs($this->user)->post(route('mechanics.store'), [
        'name' => 'Juan Pérez',
        'address' => 'Av Hidalgo 45',
        'phone' => '9821234567',
        'email' => 'juan@example.com',
        'active' => true,
        'branches' => [$this->branch1->id, $this->branch2->id],
        'primary_branch_id' => $this->branch1->id,
    ]);

    $response->assertRedirect(route('mechanics.index'));

    $mechanic = Mechanic::where('email', 'juan@example.com')->first();
    expect($mechanic)->not->toBeNull();
    expect($mechanic->name)->toBe('Juan Pérez');
    expect($mechanic->address)->toBe('Av Hidalgo 45');
    expect($mechanic->phone)->toBe('9821234567');
    expect($mechanic->branches)->toHaveCount(2);

    $primaryBranch = $mechanic->branches()->wherePivot('is_primary', true)->first();
    expect($primaryBranch)->not->toBeNull();
    expect($primaryBranch->id)->toBe($this->branch1->id);
});

test('can render edit mechanic page with mechanic and branches', function () {
    $mechanic = Mechanic::create([
        'name' => 'Mario Rossi',
        'address' => 'Calle 10 #20',
        'phone' => '9824445566',
        'email' => 'mario@example.com',
        'active' => true,
    ]);
    $mechanic->branches()->attach($this->branch1->id, ['is_primary' => true]);

    $response = $this->actingAs($this->user)->get(route('mechanics.edit', $mechanic));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('mechanics/edit')
        ->where('mechanic.name', 'Mario Rossi')
        ->where('mechanic.branches.0.id', $this->branch1->id)
        ->where('mechanic.branches.0.is_primary', true)
        ->has('branches', 2)
    );
});

test('can update mechanic details and assigned branches', function () {
    $mechanic = Mechanic::create([
        'name' => 'Luis Alberto',
        'address' => 'Calle Vieja 1',
        'phone' => '1111111111',
        'email' => 'luis@example.com',
        'active' => true,
    ]);
    $mechanic->branches()->attach($this->branch1->id, ['is_primary' => true]);

    $response = $this->actingAs($this->user)->put(route('mechanics.update', $mechanic), [
        'name' => 'Luis Alberto Gómez',
        'address' => 'Calle Nueva 2',
        'phone' => '9999999999',
        'email' => 'luis_nuevo@example.com',
        'active' => true,
        'branches' => [$this->branch2->id],
        'primary_branch_id' => $this->branch2->id,
    ]);

    $response->assertRedirect(route('mechanics.index'));

    $mechanic->refresh();
    expect($mechanic->name)->toBe('Luis Alberto Gómez');
    expect($mechanic->address)->toBe('Calle Nueva 2');
    expect($mechanic->phone)->toBe('9999999999');
    expect($mechanic->email)->toBe('luis_nuevo@example.com');
    expect($mechanic->branches)->toHaveCount(1);
    expect($mechanic->branches->first()->id)->toBe($this->branch2->id);
    expect((bool) $mechanic->branches->first()->pivot->is_primary)->toBeTrue();
});

test('can toggle mechanic active state', function () {
    $mechanic = Mechanic::create([
        'name' => 'Pedro Sánchez',
        'active' => true,
    ]);

    $response = $this->actingAs($this->user)->post(route('mechanics.toggle-active', $mechanic));
    $response->assertRedirect();

    expect($mechanic->fresh()->active)->toBeFalse();
});
