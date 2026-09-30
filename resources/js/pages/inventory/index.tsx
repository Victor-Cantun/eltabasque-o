import { Head, Link, router } from '@inertiajs/react';
import { Download, Pencil, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type InventoryRow = {
    id: number;
    stock: string;
    minimum_stock: string;
    branch: { name: string };
    product: {
        id: number;
        name: string;
        internal_code: string;
        original_code?: string | null;
        sku?: string;
    };
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    inventories: {
        data: InventoryRow[];
        links?: PaginationLink[];
    };
    branches: { id: number; name: string }[];
    isAdmin?: boolean;
    filters: {
        branch_id?: string;
        low_stock?: string;
        min_stock?: string;
        search?: string;
    };
};

export default function Index({ inventories, branches, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [minStock, setMinStock] = useState(filters.min_stock ?? '');

    const filterByBranch = (branchId: string) => {
        router.get(
            '/inventory',
            {
                ...filters,
                branch_id: branchId || undefined,
                search: search || undefined,
                min_stock: minStock || undefined,
            },
            {
                preserveState: true,
            },
        );
    };

    // Debounce para no disparar una request por cada tecla
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (
                search !== (filters.search ?? '') ||
                minStock !== (filters.min_stock ?? '')
            ) {
                router.get(
                    '/inventory',
                    {
                        ...filters,
                        search: search || undefined,
                        min_stock: minStock || undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, minStock]);

    const exportUrl = () => {
        const params = new URLSearchParams();
        if (filters.branch_id) params.set('branch_id', filters.branch_id);
        if (search) params.set('search', search);
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
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-64 flex-1">
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Buscar producto
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Nombre, código interno o código original..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border py-2 pl-9 pr-8 text-sm"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
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

                    <Link href="/inventory-movements" className="rounded-md border px-4 py-2 text-sm">
                        Historial de movimientos
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-800 text-white">
                            <tr>
                                <th className="p-3 text-left">Sucursal</th>
                                <th className="p-3 text-left">Código interno</th>
                                <th className="p-3 text-left">Código original</th>
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
                                    <td className="p-3 font-medium">{row.product.internal_code || '—'}</td>
                                    <td className="p-3 text-muted-foreground">{row.product.original_code || '—'}</td>
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
                            {inventories.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                        No se encontraron registros en el inventario.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {inventories.links && inventories.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {inventories.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded border px-3 py-1 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}