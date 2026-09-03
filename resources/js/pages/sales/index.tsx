import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Eye, Calendar, Building2, Filter, RotateCcw, Wrench, Package, DollarSign, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Branch = {
    id: number;
    name: string;
    code: string;
};

type Mechanic = {
    id: number;
    name: string;
};

type SaleItem = {
    id: number;
    item_type?: 'product' | 'service';
    quantity: string | number;
    unit_price: string | number;
    total: string | number;
    product?: {
        id: number;
        name: string;
        sku: string;
    };
    mechanic?: {
        id: number;
        name: string;
    };
};

type Sale = {
    id: number;
    folio: string;
    sale_type: string;
    subtotal: string | number;
    discount: string | number;
    tax: string | number;
    total: string | number;
    service_total?: string | number;
    products_total?: string | number;
    status: 'completed' | 'cancelled';
    created_at: string;
    branch: Branch;
    user: { id: number; name: string };
    customer?: { id: number; name: string } | null;
    items: SaleItem[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedSales = {
    data: Sale[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
    total: number;
};

type MechanicReportItem = {
    mechanic_id: number;
    mechanic_name: string;
    total_services_count: number | string;
    total_services_revenue: number | string;
};

type Props = {
    sales: PaginatedSales;
    branches: Branch[];
    mechanics: Mechanic[];
    isAdmin?: boolean;
    summary: {
        total_revenue: number;
        total_products: number;
        total_services: number;
        completed_count: number;
    };
    mechanicsReport: MechanicReportItem[];
    filters: {
        branch_id?: string;
        status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
        mechanic_id?: string;
    };
};

export default function Index({
    sales,
    branches,
    mechanics,
    isAdmin = false,
    summary,
    mechanicsReport = [],
    filters,
}: Props) {
    const [branchId, setBranchId] = useState(filters.branch_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [mechanicId, setMechanicId] = useState(filters.mechanic_id ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters();
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    const applyFilters = () => {
        router.get(
            '/sales',
            {
                branch_id: branchId || undefined,
                status: status || undefined,
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                mechanic_id: mechanicId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleBranchChange = (value: string) => {
        setBranchId(value);
        router.get(
            '/sales',
            {
                branch_id: value || undefined,
                status: status || undefined,
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                mechanic_id: mechanicId || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(
            '/sales',
            {
                branch_id: branchId || undefined,
                status: value || undefined,
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                mechanic_id: mechanicId || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleMechanicChange = (value: string) => {
        setMechanicId(value);
        router.get(
            '/sales',
            {
                branch_id: branchId || undefined,
                status: status || undefined,
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                mechanic_id: value || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDateFromChange = (value: string) => {
        setDateFrom(value);
        router.get(
            '/sales',
            {
                branch_id: branchId || undefined,
                status: status || undefined,
                search: search || undefined,
                date_from: value || undefined,
                date_to: dateTo || undefined,
                mechanic_id: mechanicId || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDateToChange = (value: string) => {
        setDateTo(value);
        router.get(
            '/sales',
            {
                branch_id: branchId || undefined,
                status: status || undefined,
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: value || undefined,
                mechanic_id: mechanicId || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const clearFilters = () => {
        setBranchId('');
        setStatus('');
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setMechanicId('');
        router.get('/sales');
    };

    return (
        <>
            <Head title="Ventas e Ingresos" />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Historial de Ventas e Ingresos</h1>
                        <p className="text-sm text-muted-foreground">
                            Consulta ingresos separados por Refacciones y Servicios, y reporte por mecánico
                        </p>
                    </div>

                    <Link
                        href="/sales/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    >
                        <ShoppingCart className="size-4" />
                        Nueva Venta / POS
                    </Link>
                </div>

                {/* Tarjetas resumen rápido separadas por Refacciones y Servicios */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Ingresos */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>Ingreso Total</span>
                            <DollarSign className="size-4 text-primary" />
                        </div>
                        <div className="mt-2 text-2xl font-bold text-foreground">
                            ${Number(summary.total_revenue).toFixed(2)}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                            {summary.completed_count} ventas completadas
                        </div>
                    </div>

                    {/* Total Refacciones */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>Venta de Refacciones</span>
                            <Package className="size-4 text-blue-500" />
                        </div>
                        <div className="mt-2 text-2xl font-bold text-foreground">
                            ${Number(summary.total_products).toFixed(2)}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                            Ingresos por piezas/productos
                        </div>
                    </div>

                    {/* Total Servicios */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm border-l-4 border-l-amber-500">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>Ingresos por Servicios</span>
                            <Wrench className="size-4 text-amber-500" />
                        </div>
                        <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            ${Number(summary.total_services).toFixed(2)}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                            Mano de obra y servicios
                        </div>
                    </div>

                    {/* Filtro Sucursal / Estado */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>Sucursal Activa</span>
                            <Building2 className="size-4 text-primary" />
                        </div>
                        <div className="mt-2 text-base font-bold truncate">
                            {branchId ? branches.find((b) => String(b.id) === branchId)?.name : 'Todas las sucursales'}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                            {sales.total} registros en la lista
                        </div>
                    </div>
                </div>

                {/* Reporte de Servicios por Mecánico */}
                {mechanicsReport.length > 0 && (
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3">
                            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                                <Users className="size-4 text-amber-600" />
                                <span>Reporte de Rendimiento por Mecánico (Filtro Actual)</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Basado en servicios completados
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-blue-800 text-white text-[11px] uppercase ">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left">Mecánico</th>
                                        <th className="px-4 py-2.5 text-center">Servicios Realizados</th>
                                        <th className="px-4 py-2.5 text-right">Total Generado</th>
                                        <th className="px-4 py-2.5 text-right">% del Ingreso de Servicios</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {mechanicsReport.map((m) => {
                                        const rev = Number(m.total_services_revenue);
                                        const pct = summary.total_services > 0
                                            ? ((rev / summary.total_services) * 100).toFixed(1)
                                            : '0';

                                        return (
                                            <tr key={m.mechanic_id} className="hover:bg-muted/20">
                                                <td className="px-4 py-2.5 font-semibold text-foreground flex items-center gap-2">
                                                    <Wrench className="size-3.5 text-amber-500" />
                                                    {m.mechanic_name}
                                                </td>
                                                <td className="px-4 py-2.5 text-center font-bold">
                                                    <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs text-amber-800 dark:text-amber-300 font-mono">
                                                        {Number(m.total_services_count)} {Number(m.total_services_count) === 1 ? 'servicio' : 'servicios'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-bold text-foreground">
                                                    ${rev.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-semibold text-muted-foreground">
                                                    {pct}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Filtros de Búsqueda */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Filter className="size-4 text-primary" />
                        Filtros de Búsqueda
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        {/* Búsqueda general */}
                        <div className="lg:col-span-2 relative">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Buscar Folio / Cliente</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Ej: VEN-01-2026..., Juan Pérez..."
                                    className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Sucursal */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sucursal</label>
                            <select
                                value={branchId}
                                onChange={(e) => handleBranchChange(e.target.value)}
                                disabled={!isAdmin}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                                {isAdmin && <option value="">Todas</option>}
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Mecánico */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Mecánico</label>
                            <select
                                value={mechanicId}
                                onChange={(e) => handleMechanicChange(e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Todos los mecánicos</option>
                                {mechanics.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Estado</label>
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Todos</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelada</option>
                            </select>
                        </div>

                        {/* Botón limpiar */}
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="w-full gap-2 text-xs"
                            >
                                <RotateCcw className="size-3.5" />
                                Limpiar
                            </Button>
                        </div>

                        {/* Fecha desde */}
                        <div className="sm:col-span-1 lg:col-span-3">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Desde</label>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={dateFrom}
                                    max={dateTo || undefined}
                                    onChange={(e) => handleDateFromChange(e.target.value)}
                                    className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Fecha hasta */}
                        <div className="sm:col-span-1 lg:col-span-3">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Hasta</label>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={dateTo}
                                    min={dateFrom || undefined}
                                    onChange={(e) => handleDateToChange(e.target.value)}
                                    className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de ventas */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-blue-800 text-white text-xs uppercase ">
                                <tr>
                                    <th className="px-4 py-3 text-left">Folio</th>
                                    <th className="px-4 py-3 text-left">Sucursal</th>
                                    <th className="px-4 py-3 text-left">Cajero</th>
                                    <th className="px-4 py-3 text-left">Cliente</th>
                                    <th className="px-4 py-3 text-right">Refacciones</th>
                                    <th className="px-4 py-3 text-right">Servicios</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-left">Fecha</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {sales.data.map((sale) => (
                                    <tr key={sale.id} className="transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3 font-semibold text-foreground">{sale.folio}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Building2 className="size-3.5 text-muted-foreground" />
                                                {sale.branch.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{sale.user.name}</td>
                                        <td className="px-4 py-3">{sale.customer?.name ?? 'Público general'}</td>
                                        <td className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                                            ${Number(sale.products_total ?? 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs font-semibold text-amber-600">
                                            ${Number(sale.service_total ?? 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-foreground">
                                            ${Number(sale.total).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {sale.status === 'completed' ? (
                                                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                                                    Completada
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">Cancelada</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(sale.created_at).toLocaleString('es-MX', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/sales/${sale.id}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                            >
                                                <Eye className="size-3.5" />
                                                Ver Detalle
                                            </Link>
                                        </td>
                                    </tr>
                                ))}

                                {sales.data.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                                            No se encontraron ventas registradas con los criterios seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginación */}
                {sales.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-end gap-1">
                        {sales.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background hover:bg-muted text-muted-foreground'
                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

