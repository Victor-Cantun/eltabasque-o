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
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e40af; color: #fff; text-align: left; padding: 5px; font-size: 8px; }
        td { padding: 4px 5px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        tr:nth-child(even) td { background: #f9fafb; }
        .num { text-align: right; white-space: nowrap; }
        .footer { position: fixed; bottom: -15px; left: 0; right: 0; text-align: center; font-size: 8px; color: #888; }
    </style>
</head>
<body>
    @php $money = fn ($v) => '$'.number_format((float) $v, 2); @endphp

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

    @if($truncated)
        <div class="warn">
            Se muestran solo los {{ number_format($movements->count()) }} movimientos más recientes de {{ number_format($totalRows) }}.
            Los totales incluyen todos. Acota el rango de fechas para ver el detalle completo.
        </div>
    @endif

    <table>
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
                <tr>
                    <td>{{ $m->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $m->branch->name }}</td>
                    <td>{{ $m->product->name }}<br><span style="color:#888">{{ $m->product->internal_code }}</span></td>
                    <td>{{ $typeLabels[$m->type] ?? $m->type }}</td>
                    <td class="num">{{ $m->quantity }}</td>
                    <td class="num">{{ $m->stock_before }} → {{ $m->stock_after }}</td>
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