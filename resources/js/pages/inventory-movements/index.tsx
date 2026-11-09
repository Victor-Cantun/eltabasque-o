import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Download, Pencil, Search, X } from 'lucide-react';
type Movement = {
    id: number;
    type: string;
    quantity: string;
    stock_before: string;
    stock_after: string;
    moved_units: string;
    unit_cost: string | null;
    unit_price: string | null;
    reason: string | null;
    created_at: string;
    branch: { name: string };
    product: { name: string; internal_code: string };
    user: { name: string } | null;
};

type Filters = {
    date_from: string | null;
    date_to: string | null;
    type: string | null;
    branch_id: string | null;
    user_id: string | null;
};

type Props = {
    movements: {
        data: Movement[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Filters;
    branches: { id: number; name: string }[];
    users: { id: number; name: string }[];
    isAdmin: boolean;
    totals: { cost: number; price: number };
    adjustments: {
        negative: number;
        positive: number;
        net: number;
        negative_count: number;
        positive_count: number;
    };    
};

const HIGHLIGHT_TYPES = ['adjustment'];

const delta = (m: Movement) => Number(m.stock_after) - Number(m.stock_before);

const rowTone = (m: Movement) => {
    if (!HIGHLIGHT_TYPES.includes(m.type)) return '';
    const d = delta(m);
    if (d < 0) return 'bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50';
    if (d > 0) return 'bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50';
    return '';
};

const stockTone = (m: Movement) => {
    if (!HIGHLIGHT_TYPES.includes(m.type)) return '';
    const d = delta(m);
    return d < 0 ? 'font-semibold text-red-600 dark:text-red-400'
         : d > 0 ? 'font-semibold text-green-600 dark:text-green-400' : '';
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

const money = (v: number | string | null) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(v ?? 0));

export default function Index({ movements, filters, branches, users, isAdmin, totals, adjustments }: Props) {
    const [form, setForm] = useState({
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        type: filters.type ?? '',
        branch_id: filters.branch_id ?? '',
        user_id: filters.user_id ?? '',
    });

    const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

    const apply = () => {
        const params = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
        router.get('/inventory-movements', params, { preserveState: true, preserveScroll: true });
    };

    const clear = () => {
        setForm({ date_from: '', date_to: '', type: '', branch_id: '', user_id: '' });
        router.get('/inventory-movements', {}, { preserveState: true });
    };

    const inputClass = 'rounded-md border bg-background px-3 py-2 text-sm';

    const exportPdfUrl = () => {
        const params = new URLSearchParams();
        (Object.entries(filters) as [string, string | null][]).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        const qs = params.toString();
        return `/inventory-movements/export-pdf${qs ? `?${qs}` : ''}`;
    };    

    return (
        <>
            <Head title="Movimientos de inventario" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Movimientos de inventario</h1>
{/*                     <Link
                        href="/inventory-movements/create"
                        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                    >
                        Nuevo movimiento
                    </Link> */}
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={exportPdfUrl()}
                        className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <Download className="h-4 w-4" />
                        Exportar PDF
                    </a>
                    <Link
                        href="/inventory-movements/create"
                        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                    >
                        Nuevo movimiento
                    </Link>
                </div>

                {/* Filtros */}
                <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-6 bg-card">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Desde</label>
                        <input type="date" className={inputClass} value={form.date_from}
                            onChange={(e) => set('date_from', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Hasta</label>
                        <input type="date" className={inputClass} value={form.date_to}
                            onChange={(e) => set('date_to', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Tipo</label>
                        <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
                            <option value="">Todos</option>
                            {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Sucursal</label>
                        <select className={inputClass} value={form.branch_id}
                            onChange={(e) => set('branch_id', e.target.value)}>
                            <option value="">{isAdmin ? 'Todas' : 'Mis sucursales'}</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Usuario</label>
                        <select className={inputClass} value={form.user_id}
                            onChange={(e) => set('user_id', e.target.value)}>
                            <option value="">Todos</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button onClick={apply}
                            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
                            Filtrar
                        </button>
                        <button onClick={clear} className="rounded-md border px-4 py-2 text-sm">
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Totales del conjunto filtrado */}
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border p-4 bg-card">
                        <div className="text-xs text-muted-foreground">Valor total al costo</div>
                        <div className="text-xl font-semibold">{money(totals.cost)}</div>
                    </div>
                    <div className="rounded-xl border p-4 bg-card">
                        <div className="text-xs text-muted-foreground">Valor total a precio público</div>
                        <div className="text-xl font-semibold">{money(totals.price)}</div>
                    </div>
                </div>
                {/* Balance de ajustes (auditoría) */}
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                        <div className="text-xs text-red-700 dark:text-red-300">
                            Ajustes negativos ({adjustments.negative_count})
                        </div>
                        <div className="text-xl font-semibold text-red-700 dark:text-red-300">
                            − {money(adjustments.negative)}
                        </div>
                        <div className="text-xs text-muted-foreground">Inventario descontado al costo</div>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                        <div className="text-xs text-green-700 dark:text-green-300">
                            Ajustes positivos ({adjustments.positive_count})
                        </div>
                        <div className="text-xl font-semibold text-green-700 dark:text-green-300">
                            + {money(adjustments.positive)}
                        </div>
                        <div className="text-xs text-muted-foreground">Inventario agregado al costo</div>
                    </div>

                    <div
                        className={`rounded-xl border p-4 ${
                            adjustments.net < 0
                                ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                                : adjustments.net > 0
                                ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                                : 'bg-card'
                        }`}
                    >
                        <div className="text-xs text-muted-foreground">Balance neto de ajustes</div>
                        <div
                            className={`text-xl font-semibold ${
                                adjustments.net < 0 ? 'text-red-700 dark:text-red-300'
                                : adjustments.net > 0 ? 'text-green-700 dark:text-green-300' : ''
                            }`}
                        >
                            {adjustments.net > 0 ? '+ ' : adjustments.net < 0 ? '− ' : ''}
                            {money(Math.abs(adjustments.net))}
                        </div>
                        <div className="text-xs text-muted-foreground">Positivos − negativos</div>
                    </div>
                </div>                

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="p-3 text-left">Fecha</th>
                                <th className="p-3 text-left">Sucursal</th>
                                <th className="p-3 text-left">Producto</th>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-right">Cantidad</th>
                                <th className="p-3 text-right">Antes → Después</th>
                                <th className="p-3 text-right">Valor (costo)</th>
                                <th className="p-3 text-right">Valor (público)</th>
                                <th className="p-3 text-left">Motivo</th>
                                <th className="p-3 text-left">Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.data.map((m) => (
                                <tr key={m.id} className={`border-t ${rowTone(m)}`}>
                                    <td className="p-3">{new Date(m.created_at).toLocaleString()}</td>
                                    <td className="p-3">{m.branch.name}</td>
                                    <td className="p-3">
                                        {m.product.name}
                                        <div className="text-xs text-muted-foreground">{m.product.internal_code}</div>
                                    </td>
                                    <td className="p-3">{TYPE_LABELS[m.type] ?? m.type}</td>
                                    <td className="p-3 text-right">{m.quantity}</td>
                                    <td  className={`p-3 text-right ${stockTone(m)}`}>{m.stock_before} → {m.stock_after}</td>
                                    <td className="p-3 text-right">{money(Number(m.moved_units) * Number(m.unit_cost ?? 0))}</td>
                                    <td className="p-3 text-right">{money(Number(m.moved_units) * Number(m.unit_price ?? 0))}</td>
                                    <td className="p-3">{m.reason ?? '—'}</td>
                                    <td className="p-3">{m.user?.name ?? 'Sistema'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-1">
                    {movements.links.map((l, i) => (
                        <Link
                            key={i}
                            href={l.url ?? '#'}
                            preserveScroll
                            className={`rounded-md border px-3 py-1 text-sm ${l.active ? 'bg-primary text-primary-foreground' : ''} ${!l.url ? 'pointer-events-none opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}