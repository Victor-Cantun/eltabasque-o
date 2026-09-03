<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $users = User::query()
            ->with([
                'branches:id,name,code',
                'roles:id,name,slug',
            ])
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('users/index', [
            'users' => $users,
            /*  'currentTeam' => [
                'slug' => $current_team,
            ] ,*/
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('users/create', [
            'branches' => Branch::query()
                ->where('active', true)
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'code',
                ]),

            'roles' => Role::query()
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'slug',
                ]),

            /* 'currentTeam' => [
                'slug' => $current_team,
            ] ,*/
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->create(
            $request->validated()
        );

        return to_route(
            'users.index',
        )->with(
            'success',
            'Usuario creado correctamente.'
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
    public function edit(string $user): Response
    {
        $userModel = User::query()
            ->with([
                'branches:id,name,code',
                'roles:id,name,slug',
            ])
            ->findOrFail($user);

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $userModel->id,
                'name' => $userModel->name,
                'email' => $userModel->email,

                'branches' => $userModel->branches
                    ->map(fn ($branch) => [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'code' => $branch->code,
                        'is_primary' => (bool) $branch->pivot->is_primary,
                    ])
                    ->values(),

                'roles' => $userModel->roles
                    ->pluck('id')
                    ->values(),
            ],

            'branches' => Branch::query()
                ->where('active', true)
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'code',
                ]),

            'roles' => Role::query()
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'slug',
                ]),

            /* 'currentTeam' => [
                'slug' => $current_team,
            ], */
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        // $userModel = User::findOrFail($user);
        $this->userService->update(
            $user,
            $request->validated()
        );

        return to_route('users.index')->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'No puedes desactivar tu propia cuenta.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        return back()->with(
            'success',
            $user->is_active ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.'
        );
    }    
}
