// resources/js/pages/inventory-movements/index.tsx

import { Head, Link } from '@inertiajs/react';

type Movement = {
    id: number;
    type: string;
    quantity: string;
    stock_before: string;
    stock_after: string;
    reason: string | null;
    created_at: string;
    branch: { name: string };
    product: { name: string; sku: string };
    user: { name: string } | null;
};

type Props = {
    movements: {
        data: Movement[];
        links: { url: string | null; label: string; active: boolean }[];
    };
};

const TYPE_LABELS: Record<string, string> = {
    entry: 'Entrada',
    exit: 'Salida',
    adjustment: 'Ajuste',
    transfer_in: 'Transferencia recibida',
    transfer_out: 'Transferencia enviada',
    sale: 'Venta',
    return: 'Devolución',
};

export default function Index({ movements }: Props) {
    return (
        <>
            <Head title="Movimientos de inventario" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Movimientos de inventario</h1>
                    <Link
                        href={`/inventory-movements/create`}
                        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                    >
                        Nuevo movimiento
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-3 text-left">Fecha</th>
                                <th className="p-3 text-left">Sucursal</th>
                                <th className="p-3 text-left">Producto</th>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-right">Cantidad</th>
                                <th className="p-3 text-right">Antes → Después</th>
                                <th className="p-3 text-left">Motivo</th>
                                <th className="p-3 text-left">Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.data.map((m) => (
                                <tr key={m.id} className="border-t">
                                    <td className="p-3">{new Date(m.created_at).toLocaleString()}</td>
                                    <td className="p-3">{m.branch.name}</td>
                                    <td className="p-3">{m.product.name}</td>
                                    <td className="p-3">{TYPE_LABELS[m.type] ?? m.type}</td>
                                    <td className="p-3 text-right">{m.quantity}</td>
                                    <td className="p-3 text-right">
                                        {m.stock_before} → {m.stock_after}
                                    </td>
                                    <td className="p-3">{m.reason ?? '—'}</td>
                                    <td className="p-3">{m.user?.name ?? 'Sistema'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}