<?php

namespace App\Http\Controllers;

use App\Http\Requests\Mechanic\StoreMechanicRequest;
use App\Http\Requests\Mechanic\UpdateMechanicRequest;
use App\Models\Branch;
use App\Models\Mechanic;
use App\Services\MechanicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MechanicController extends Controller
{
    public function __construct(private MechanicService $mechanicService) {}

    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $mechanics = Mechanic::query()
            ->with(['branches:id,name,code'])
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('mechanics/index', [
            'mechanics' => $mechanics,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('mechanics/create', [
            'branches' => Branch::query()
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
        ]);
    }

    public function store(StoreMechanicRequest $request): Response|RedirectResponse|JsonResponse
    {
        $mechanic = $this->mechanicService->create($request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Mecánico creado correctamente',
                'mechanic' => $mechanic,
            ], 201);
        }

        return to_route('mechanics.index')->with('success', 'Mecánico creado correctamente');
    }

    public function edit(Mechanic $mechanic): Response
    {
        $mechanic->load('branches:id,name,code');

        return Inertia::render('mechanics/edit', [
            'mechanic' => [
                'id' => $mechanic->id,
                'name' => $mechanic->name,
                'address' => $mechanic->address,
                'phone' => $mechanic->phone,
                'email' => $mechanic->email,
                'active' => (bool) $mechanic->active,
                'branches' => $mechanic->branches->map(fn ($branch) => [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'code' => $branch->code,
                    'is_primary' => (bool) $branch->pivot->is_primary,
                ])->values(),
            ],
            'branches' => Branch::query()
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
        ]);
    }

    public function update(UpdateMechanicRequest $request, Mechanic $mechanic): RedirectResponse
    {
        $this->mechanicService->update($mechanic, $request->validated());

        return to_route('mechanics.index')
            ->with('success', 'Mecánico actualizado correctamente.');
    }

    public function toggleActive(Mechanic $mechanic): RedirectResponse
    {
        $this->mechanicService->toggleActive($mechanic);

        return back()->with(
            'success',
            $mechanic->active
                ? 'Mecánico activado correctamente.'
                : 'Mecánico desactivado correctamente.'
        );
    }
}
