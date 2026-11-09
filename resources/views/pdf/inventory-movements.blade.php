<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Movimientos de inventario</title>
    <style>
        @page { margin: 30px 25px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 9px; color: #222; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        .meta { color: #555; margin-bottom: 10px; line-height: 1.5; }
        .totals { margin-bottom: 10px; }
        .totals span { display: inline-block; margin-right: 20px; font-size: 11px; font-weight: bold; }
        .warn { color: #b45309; margin-bottom: 8px; }

        /* Cards de balance de ajustes */
        table.cards { width: 100%; border-collapse: separate; border-spacing: 6px 0; margin: 0 -6px 12px; }
        table.cards td { width: 33.33%; padding: 8px 10px; border: 1px solid #e5e7eb; vertical-align: top; }
        .card-label { font-size: 8px; }
        .card-value { font-size: 14px; font-weight: bold; margin: 2px 0; }
        .card-note { font-size: 7px; color: #6b7280; }
        .card-neg { background: #fef2f2; border-color: #fecaca !important; color: #b91c1c; }
        .card-pos { background: #f0fdf4; border-color: #bbf7d0 !important; color: #15803d; }
        .card-zero { background: #f9fafb; color: #374151; }

        /* Tabla de detalle */
        table.data { width: 100%; border-collapse: collapse; }
        table.data th { background: #1e40af; color: #fff; text-align: left; padding: 5px; font-size: 8px; }
        table.data td { padding: 4px 5px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        table.data tr:nth-child(even) td { background: #f9fafb; }
        /* Estos van después del zebra para que lo sobrescriban */
        table.data tr.row-neg td { background: #fee2e2; }
        table.data tr.row-pos td { background: #dcfce7; }
        td.stock-neg { color: #b91c1c; font-weight: bold; }
        td.stock-pos { color: #15803d; font-weight: bold; }

        .num { text-align: right; white-space: nowrap; }
        .footer { position: fixed; bottom: -15px; left: 0; right: 0; text-align: center; font-size: 8px; color: #888; }
    </style>
</head>
<body>
    @php
        $money = fn ($v) => '$'.number_format((float) $v, 2);
        $net = $adjustments['net'];
        $netClass = $net < 0 ? 'card-neg' : ($net > 0 ? 'card-pos' : 'card-zero');
    @endphp

    <h1>Movimientos de inventario</h1>
    <div class="meta">
        Generado: {{ $generatedAt->format('d/m/Y H:i') }} · Por: {{ $generatedBy }}<br>
        Periodo:
        {{ $filters['date_from'] ? \Carbon\Carbon::parse($filters['date_from'])->format('d/m/Y') : 'inicio' }}
        al
        {{ $filters['date_to'] ? \Carbon\Carbon::parse($filters['date_to'])->format('d/m/Y') : 'hoy' }}
        · Tipo: {{ $typeLabel ?? 'Todos' }}
        · Sucursal: {{ $branchName ?? 'Todas' }}
        · Usuario: {{ $userName ?? 'Todos' }}
    </div>

    <div class="totals">
        <span>Total al costo: {{ $money($totals['cost']) }}</span>
        <span>Total a precio público: {{ $money($totals['price']) }}</span>
        <span>Movimientos: {{ number_format($totalRows) }}</span>
    </div>

    {{-- Balance de ajustes (auditoría) --}}
    <table class="cards">
        <tr>
            <td class="card-neg">
                <div class="card-label">Ajustes negativos ({{ number_format($adjustments['negative_count']) }})</div>
                <div class="card-value">− {{ $money($adjustments['negative']) }}</div>
                <div class="card-note">Inventario descontado al costo</div>
            </td>
            <td class="card-pos">
                <div class="card-label">Ajustes positivos ({{ number_format($adjustments['positive_count']) }})</div>
                <div class="card-value">+ {{ $money($adjustments['positive']) }}</div>
                <div class="card-note">Inventario agregado al costo</div>
            </td>
            <td class="{{ $netClass }}">
                <div class="card-label">Balance neto de ajustes</div>
                <div class="card-value">
                    {{ $net > 0 ? '+ ' : ($net < 0 ? '− ' : '') }}{{ $money(abs($net)) }}
                </div>
                <div class="card-note">Positivos − negativos</div>
            </td>
        </tr>
    </table>

    @if($truncated)
        <div class="warn">
            Se muestran solo los {{ number_format($movements->count()) }} movimientos más recientes de {{ number_format($totalRows) }}.
            Los totales incluyen todos. Acota el rango de fechas para ver el detalle completo.
        </div>
    @endif

    <table class="data">
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Sucursal</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th class="num">Cantidad</th>
                <th class="num">Antes → Después</th>
                <th class="num">Valor (costo)</th>
                <th class="num">Valor (público)</th>
                <th>Motivo</th>
                <th>Usuario</th>
            </tr>
        </thead>
        <tbody>
            @foreach($movements as $m)
                @php
                    $delta = (float) $m->stock_after - (float) $m->stock_before;
                    $tone = in_array($m->type, $highlightTypes) ? ($delta < 0 ? 'neg' : ($delta > 0 ? 'pos' : '')) : '';
                @endphp
                <tr class="{{ $tone ? 'row-'.$tone : '' }}">
                    <td>{{ $m->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $m->branch->name }}</td>
                    <td>{{ $m->product->name }}<br><span style="color:#888">{{ $m->product->internal_code }}</span></td>
                    <td>{{ $typeLabels[$m->type] ?? $m->type }}</td>
                    <td class="num">{{ $m->quantity }}</td>
                    <td class="num {{ $tone ? 'stock-'.$tone : '' }}">{{ $m->stock_before }} → {{ $m->stock_after }}</td>
                    <td class="num">{{ $money($m->moved_units * ($m->unit_cost ?? 0)) }}</td>
                    <td class="num">{{ $money($m->moved_units * ($m->unit_price ?? 0)) }}</td>
                    <td>{{ $m->reason ?? '—' }}</td>
                    <td>{{ $m->user?->name ?? 'Sistema' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">Movimientos de inventario · {{ config('app.name') }}</div>
</body>
</html>