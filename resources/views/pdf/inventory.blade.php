<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Inventario</title>
    <style>
        @page { margin: 30px 25px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #222; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        .meta { color: #666; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1f2937; color: #fff; text-align: left; padding: 6px; font-size: 9px; }
        td { padding: 5px 6px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f9fafb; }
        .num { text-align: right; }
        .low { color: #b91c1c; font-weight: bold; }
        .footer { position: fixed; bottom: -15px; left: 0; right: 0; text-align: center; font-size: 8px; color: #888; }
    </style>
</head>
<body>
    <h1>Reporte de inventario</h1>
    <div class="meta">
        Generado: {{ $generatedAt->format('d/m/Y H:i') }} · Por: {{ $generatedBy }}
        @if($branchName) · Sucursal: {{ $branchName }} @endif
        @if($search) · Búsqueda: "{{ $search }}" @endif
        @if($minStock !== null && $minStock !== '') · Stock máx.: {{ $minStock }} @endif
        · Total: {{ $inventories->count() }} registros
    </div>

    <table>
        <thead>
            <tr>
                <th>Sucursal</th>
                <th>Producto</th>
                <th>Código interno</th>
                <th>Código original</th>
                <th class="num">Stock</th>
                <th class="num">Stock mínimo</th>
            </tr>
        </thead>
        <tbody>
            @foreach($inventories as $row)
                <tr>
                    <td>{{ $row->branch->name }}</td>
                    <td>{{ $row->product->name }}</td>
                    <td>{{ $row->product->internal_code }}</td>
                    <td>{{ $row->product->original_code }}</td>
                    <td class="num {{ $row->stock <= $row->minimum_stock ? 'low' : '' }}">{{ $row->stock }}</td>
                    <td class="num">{{ $row->minimum_stock }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">Inventario · {{ config('app.name') }}</div>
</body>
</html>