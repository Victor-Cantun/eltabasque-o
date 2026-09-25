import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Ingresos from '@/components/branches/sumary';
import { dashboard } from '@/routes';
import { AlertCircle, Calendar, Package, Users, Wrench } from 'lucide-react';
import LowStock from '@/components/branches/low-stock';
import IncomeTrend from '@/components/branches/income-trend';

type Branch = { id: number; name: string; code: string };

type BranchSummary = {
    branch_id: number;
    branch_name: string;
    parts_income: number;
    service_income: number;
    total_income: number;
};

type MechanicReportItem = {
    mechanic_id: number;
    mechanic_name: string;
    branch_id: number;
    total_services_count: number | string;
    total_services_revenue: number | string;
};

type TopProduct = {
    id: number;
    name: string;
    sku: string;
    total_quantity: number | string;
    total_revenue: number | string;
};

type LowStockProduct = {
    id: number;
    name: string;
    internal_code: string;
    stock: number | string;
    minimum_stock: number | string;
};

type IncomeTrendPoint = {
    date: string;
    parts_income: number | string;
    service_income: number | string;
    total_income: number | string;
};

type TotalInventory = {
    branch_id :number;
    branch_name: string;
    total:number;
}
type DashboardData = {
    branches_summary: BranchSummary[];
    mechanics_report: Record<string, MechanicReportItem[]>;
    top_products: Record<string, TopProduct[]>;
    low_stock_products: Record<string, LowStockProduct[]>;
    income_trend: IncomeTrendPoint[];
    total_inventory: TotalInventory[];
};

type Props = {
    branches: Branch[];
    isAdmin?: boolean;
    filters: { date_from?: string; date_to?: string };
};

const EMPTY_DATA: DashboardData = { 
    branches_summary: [], 
    mechanics_report: {}, 
    top_products: {}, 
    low_stock_products: {},
    income_trend: [], 
    total_inventory:[],
};

const fmt = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard({ branches, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [data, setData] = useState<DashboardData>(EMPTY_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const timeout = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (dateFrom) params.set('date_from', dateFrom);
                if (dateTo) params.set('date_to', dateTo);

                const res = await fetch(`/dashboard/data?${params.toString()}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    throw new Error(`El servidor respondió ${res.status}`);
                }

                const contentType = res.headers.get('content-type') ?? '';
                if (!contentType.includes('application/json')) {
                    throw new Error('La respuesta no fue JSON (revisa sesión/ruta)');
                }

                setData(await res.json());
            } catch (e) {
                if ((e as Error).name !== 'AbortError') {
                    console.error(e);
                    setError((e as Error).message);
                }
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [dateFrom, dateTo]);
console.log("inventario",data.total_inventory);
    return (
        <>
            <Head title="Dashboard" />

            {/* Filtros de fecha */}
            <div className="flex flex-wrap items-end gap-4 rounded-xl p-4">
                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Desde</label>
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                        <input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Hasta</label>
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mx-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    No se pudo cargar el dashboard: {error}
                </div>
            )}

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {branches.map((branch) => {
                    const summary = data.branches_summary.find((s) => s.branch_id === branch.id);
                    const mechanics = data.mechanics_report[String(branch.id)] ?? [];
                    const products = data.top_products[String(branch.id)] ?? [];
                    const total_inventory = data.total_inventory.find((s) => s.branch_id === branch.id);
                    
                    return (
                        <div key={branch.id} className="rounded-xl border bg-card shadow-sm">
                            <h2 className="rounded-t-lg p-2 text-lg font-bold bg-blue-700 text-white">{branch.name}</h2>
                            <div className="p-2">
                                <div className="grid gap-4 lg:grid-cols-4">
                                    {/* Ingresos totales + desglose */}
                                    <Ingresos branch={branch} summary={summary} loading={loading} total_inventory={total_inventory} />

                                    {/* Servicios por mecánico */}
                                    <div className="rounded-lg border">
                                        <div className="flex items-center gap-2 border-b bg-amber-50/50 px-3 py-2 text-xs font-semibold dark:bg-amber-950/20">
                                            <Wrench className="size-3.5 text-amber-600" />
                                            Servicios por mecánico
                                        </div>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b text-muted-foreground">
                                                    <th className="px-3 py-1.5 text-left font-medium">Mecánico</th>
                                                    <th className="px-3 py-1.5 text-center font-medium">
                                                        <Users className="mx-auto size-3" />
                                                    </th>
                                                    <th className="px-3 py-1.5 text-right font-medium">Ingreso</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                                            Cargando...
                                                        </td>
                                                    </tr>
                                                ) : mechanics.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                                            Sin servicios en el rango
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    mechanics.map((m) => (
                                                        <tr key={m.mechanic_id}>
                                                            <td className="px-3 py-1.5">{m.mechanic_name}</td>
                                                            <td className="px-3 py-1.5 text-center text-muted-foreground">
                                                                {Number(m.total_services_count)} svc
                                                            </td>
                                                            <td className="px-3 py-1.5 text-right font-semibold">
                                                                ${fmt(Number(m.total_services_revenue))}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Productos más demandados */}
                                    <div className="rounded-lg border">
                                        <div className="flex items-center gap-2 border-b bg-blue-50/50 px-3 py-2 text-xs font-semibold dark:bg-blue-950/20">
                                            <Package className="size-3.5 text-blue-600" />
                                            Productos más demandados
                                        </div>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b text-muted-foreground">
                                                    <th className="px-3 py-1.5 text-left font-medium">Producto</th>
                                                    <th className="px-3 py-1.5 text-center font-medium">Cant.</th>
                                                    <th className="px-3 py-1.5 text-right font-medium">Ingreso</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                                            Cargando...
                                                        </td>
                                                    </tr>
                                                ) : products.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                                            Sin ventas en el rango
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    products.map((p) => (
                                                        <tr key={p.id}>
                                                            <td className="px-3 py-1.5">
                                                                <span className="block truncate max-w-[10rem]" title={p.name}>
                                                                    {p.name}
                                                                </span>
                                                                <span className="text-muted-foreground">{p.sku}</span>
                                                            </td>
                                                            <td className="px-3 py-1.5 text-center text-muted-foreground">
                                                                {Number(p.total_quantity)}
                                                            </td>
                                                            <td className="px-3 py-1.5 text-right font-semibold">
                                                                ${fmt(Number(p.total_revenue))}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Stock bajo — nuevo */}
                                    <LowStock
                                        products={data.low_stock_products[String(branch.id)] ?? []}
                                        loading={loading}
                                    />                                
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Tendencia de ingresos */}
                <IncomeTrend />

            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};