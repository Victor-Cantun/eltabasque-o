import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

type InventoryRow = {
    id: number;
    stock: string;
    minimum_stock: string;
    branch: { name: string };
    product: { name: string; sku: string };
};

type Props = {
    inventories: { data: InventoryRow[] };
    branches: { id: number; name: string }[];
    filters: { branch_id?: string; low_stock?: string; min_stock?: string };
};

export default function Index({ inventories, branches, filters }: Props) {
    const [minStock, setMinStock] = useState(filters.min_stock ?? '');

    const filterByBranch = (branchId: string) => {
        router.get('/inventory', { ...filters, branch_id: branchId || undefined }, {
            preserveState: true,
        });
    };

    // Debounce para no disparar una request por cada tecla
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (minStock !== (filters.min_stock ?? '')) {
                router.get('/inventory', { ...filters, min_stock: minStock || undefined }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [minStock]);

    const exportUrl = () => {
        const params = new URLSearchParams();
        if (filters.branch_id) params.set('branch_id', filters.branch_id);
        if (minStock) params.set('min_stock', minStock);
        const qs = params.toString();
        return `/inventory/export${qs ? `?${qs}` : ''}`;
    };

    return (
        <>
            <Head title="Inventario" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Inventario</h1>
                    <Link
                        href="/inventory-movements/create"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        + Registrar movimiento
                    </Link>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Sucursal
                        </label>
                        <select
                            defaultValue={filters.branch_id ?? ''}
                            onChange={(e) => filterByBranch(e.target.value)}
                            className="w-64 rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">Todas las sucursales</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Stock máximo (≤)
                        </label>
                        <input
                            type="number"
                            min={0}
                            placeholder="Ej. 20"
                            value={minStock}
                            onChange={(e) => setMinStock(e.target.value)}
                            className="w-32 rounded-md border px-3 py-2 text-sm"
                        />
                    </div>

                    <a
                        href={exportUrl()}
                        className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </a>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="p-3 text-left">Sucursal</th>
                                <th className="p-3 text-left">Producto</th>
                                <th className="p-3 text-right">Stock</th>
                                <th className="p-3 text-right">Mínimo</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventories.data.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`border-t ${
                                        Number(row.stock) <= Number(row.minimum_stock)
                                            ? 'bg-red-50 dark:bg-red-950/20'
                                            : ''
                                    }`}
                                >
                                    <td className="p-3">{row.branch.name}</td>
                                    <td className="p-3">{row.product.name}</td>
                                    <td className="p-3 text-right">{row.stock}</td>
                                    <td className="p-3 text-right">{row.minimum_stock}</td>
                                    <td className="p-3 text-right">
                                        <Link href={`/inventory/${row.id}/edit`} className="hover:cursor-pointer">
                                            <Pencil className="h-4 w-4 text-blue-800" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}