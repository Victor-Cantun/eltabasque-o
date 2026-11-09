<?php

namespace App\Http\Controllers;

use App\Http\Requests\InventoryMovement\StoreInventoryMovementRequest;
use App\Models\Branch;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

use Barryvdh\DomPDF\Facade\Pdf;

class InventoryMovementController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService,
    ) {}

    private const ADJUSTMENT_TYPES = ['adjustment'];

    private function adjustmentTotalsFor(Builder $base): array
    {
        $delta = '(inventory_movements.stock_after - inventory_movements.stock_before)';

        $t = (clone $base)
            ->whereIn('inventory_movements.type', self::ADJUSTMENT_TYPES)
            ->selectRaw("COALESCE(SUM(CASE WHEN $delta < 0 THEN ABS($delta) * products.cost ELSE 0 END), 0) as negative_cost")
            ->selectRaw("COALESCE(SUM(CASE WHEN $delta > 0 THEN $delta * products.cost ELSE 0 END), 0) as positive_cost")
            ->selectRaw("COALESCE(SUM(CASE WHEN $delta < 0 THEN 1 ELSE 0 END), 0) as negative_count")
            ->selectRaw("COALESCE(SUM(CASE WHEN $delta > 0 THEN 1 ELSE 0 END), 0) as positive_count")
            ->first();

        $negative = (float) $t->negative_cost;
        $positive = (float) $t->positive_cost;

        return [
            'negative'       => $negative,
            'positive'       => $positive,
            'net'            => $positive - $negative,
            'negative_count' => (int) $t->negative_count,
            'positive_count' => (int) $t->positive_count,
        ];
    }

    public function index(Request $request): Response
    {
        ['filters' => $filters, 'isAdmin' => $isAdmin, 'branchIds' => $userBranchIds] = $this->resolveScope($request);

        $base = $this->movementsQuery($filters, $isAdmin, $userBranchIds);

        $movements = $this->withValues(clone $base)
            ->with(['branch:id,name', 'product:id,name,internal_code,original_code', 'user:id,name'])
            ->latest('inventory_movements.created_at')
            ->paginate(20)
            ->withQueryString();

        $totals = $this->totalsFor($base);
        $adjustments = $this->adjustmentTotalsFor($base);
        $branches = $isAdmin
            ? Branch::query()->select('id', 'name')->orderBy('name')->get()
            : Branch::query()->whereIn('id', $userBranchIds)->select('id', 'name')->orderBy('name')->get();

        $users = $isAdmin
            ? User::query()->select('id', 'name')->orderBy('name')->get()
            : User::query()
                ->whereHas('branches', fn ($q) => $q->whereIn('branches.id', $userBranchIds))
                ->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('inventory-movements/index', [
            'movements' => $movements,
            'filters'   => $filters,
            'branches'  => $branches,
            'users'     => $users,
            'isAdmin'   => $isAdmin,
            'totals'    => $totals,
            'adjustments' => $adjustments,
        ]);
    }

    public function exportPdf(Request $request)
    {
        ['filters' => $filters, 'isAdmin' => $isAdmin, 'branchIds' => $userBranchIds] = $this->resolveScope($request);

        $base = $this->movementsQuery($filters, $isAdmin, $userBranchIds);

        $limit = 2000; // dompdf consume mucha memoria con reportes enormes
        $total = (clone $base)->count();

        $movements = $this->withValues(clone $base)
            ->with(['branch:id,name', 'product:id,name,internal_code', 'user:id,name'])
            ->latest('inventory_movements.created_at')
            ->limit($limit)
            ->get();

        $pdf = Pdf::loadView('pdf.inventory-movements', [
            'movements'   => $movements,
            'totals'      => $this->totalsFor($base),
            'adjustments'    => $this->adjustmentTotalsFor($base),   // <- nuevo
            'highlightTypes' => self::ADJUSTMENT_TYPES,              // <- nuevo
            'filters'     => $filters,
            'typeLabel'   => self::TYPE_LABELS[$filters['type']] ?? null,
            'branchName'  => $filters['branch_id'] ? Branch::find($filters['branch_id'])?->name : null,
            'userName'    => $filters['user_id'] ? User::find($filters['user_id'])?->name : null,
            'truncated'   => $total > $limit,
            'totalRows'   => $total,
            'generatedAt' => now(),
            'generatedBy' => $request->user()->name,
            'typeLabels'  => self::TYPE_LABELS,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('movimientos_'.now()->format('Y-m-d_His').'.pdf');
    }

    private const TYPE_LABELS = [
        'entry'        => 'Entrada',
        'exit'         => 'Salida',
        'adjustment'   => 'Ajuste',
        'transfer_in'  => 'Transferencia recibida',
        'transfer_out' => 'Transferencia enviada',
        'sale'         => 'Venta',
        'return'       => 'Devolución',
    ];

    /**
     * Filtros del request + alcance de sucursales según el rol.
     */
    private function resolveScope(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('slug', 'administrator')->exists();

        $userBranchIds = $user->branches()->pluck('branches.id')->toArray();
        if (empty($userBranchIds) && $user->primaryBranch()->first()) {
            $userBranchIds = [$user->primaryBranch()->first()->id];
        }

        $filters = [
            'date_from' => $request->input('date_from'),
            'date_to'   => $request->input('date_to'),
            'type'      => $request->input('type'),
            'branch_id' => $request->input('branch_id'),
            'user_id'   => $request->input('user_id'),
        ];

        if (! $isAdmin) {
            if (! $filters['branch_id'] || ! in_array((int) $filters['branch_id'], $userBranchIds)) {
                $filters['branch_id'] = null;
            }
        }

        return ['filters' => $filters, 'isAdmin' => $isAdmin, 'branchIds' => $userBranchIds];
    }

    /**
     * Agrega unidades movidas, costo y precio público a la consulta.
     */
    private function withValues(Builder $query): Builder
    {
        return $query
            ->select('inventory_movements.*')
            ->selectRaw('ABS(inventory_movements.stock_after - inventory_movements.stock_before) as moved_units')
            ->selectRaw('products.cost as unit_cost')
            ->selectRaw(
                "(select pp.price from product_prices pp
                join price_types pt on pt.id = pp.price_type_id
                where pp.product_id = products.id and pt.slug = 'public' limit 1) as unit_price"
            );
    }

    private function totalsFor(Builder $base): array
    {
        $totals = (clone $base)
            ->selectRaw('COALESCE(SUM(ABS(inventory_movements.stock_after - inventory_movements.stock_before) * products.cost), 0) as total_cost')
            ->selectRaw(
                "COALESCE(SUM(ABS(inventory_movements.stock_after - inventory_movements.stock_before) * COALESCE((
                    select pp.price from product_prices pp
                    join price_types pt on pt.id = pp.price_type_id
                    where pp.product_id = products.id and pt.slug = 'public' limit 1
                ), 0)), 0) as total_price"
            )
            ->first();

        return [
            'cost'  => (float) $totals->total_cost,
            'price' => (float) $totals->total_price,
        ];
    }

    private function movementsQuery(array $filters, bool $isAdmin, array $userBranchIds): Builder
    {
        return InventoryMovement::query()
            ->join('products', 'products.id', '=', 'inventory_movements.product_id')
            ->when(! $isAdmin, fn ($q) => $q->whereIn('inventory_movements.branch_id', $userBranchIds))
            ->when($filters['branch_id'], fn ($q, $v) => $q->where('inventory_movements.branch_id', $v))
            ->when($filters['type'], fn ($q, $v) => $q->where('inventory_movements.type', $v))
            ->when($filters['user_id'], fn ($q, $v) => $q->where('inventory_movements.user_id', $v))
            ->when($filters['date_from'], fn ($q, $v) => $q->whereDate('inventory_movements.created_at', '>=', $v))
            ->when($filters['date_to'], fn ($q, $v) => $q->whereDate('inventory_movements.created_at', '<=', $v));
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('slug', 'administrator')->exists();

        $userBranchIds = $user->branches()->pluck('branches.id')->toArray();
        if (empty($userBranchIds) && $user->primaryBranch()->first()) {
            $userBranchIds = [$user->primaryBranch()->first()->id];
        }

        $branches = $isAdmin
            ? Branch::query()->select('id', 'name')->orderBy('name')->get()
            : Branch::query()->whereIn('id', $userBranchIds)->select('id', 'name')->orderBy('name')->get();

        $defaultBranchId = ! $isAdmin && ! empty($userBranchIds) ? $userBranchIds[0] : null;

        return Inertia::render('inventory-movements/create', [
            'branches' => $branches,
            'isAdmin' => $isAdmin,
            'defaultBranchId' => $defaultBranchId,

            'products' => Product::query()
                ->where('active', true)
                ->select('id', 'name', 'internal_code', 'original_code')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreInventoryMovementRequest $request): RedirectResponse
    {
        $this->inventoryService->registerMovement(
            $request->validated()
        );

        return to_route('inventory-movements.index')
            ->with('success', 'Movimiento registrado correctamente.');
    }
}
