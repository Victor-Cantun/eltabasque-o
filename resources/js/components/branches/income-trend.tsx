// resources/js/components/branches/income-trend.tsx
import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar } from 'lucide-react';

type IncomeTrendPoint = {
    date: string;
    parts_income: number | string;
    service_income: number | string;
    total_income: number | string;
};

const fmt = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

export default function IncomeTrend() {
    const [dateFrom, setDateFrom] = useState(daysAgo(30));
    const [dateTo, setDateTo] = useState(daysAgo(0));
    const [points, setPoints] = useState<IncomeTrendPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const timeout = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
                const res = await fetch(`/dashboard/income-trend?${params.toString()}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);

                const json = await res.json();
                setPoints(json.income_trend ?? []);
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

    const chartData = points.map((d) => ({
        date: new Date(`${d.date}T00:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
        Total: Number(d.total_income),
        Refacciones: Number(d.parts_income),
        Servicios: Number(d.service_income),
    }));

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-sm font-bold">Tendencia de ingresos por fecha</h2>

                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Desde</label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <input
                                type="date"
                                value={dateFrom}
                                max={dateTo}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="rounded-md border bg-background py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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
                                min={dateFrom}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="rounded-md border bg-background py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    No se pudo cargar la tendencia: {error}
                </div>
            )}

            <div className="h-72">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Cargando...
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Sin datos en el rango seleccionado
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="date" fontSize={11} />
                            <YAxis fontSize={11} tickFormatter={(v) => `$${v}`} />
                            <Tooltip formatter={(value: number) => `$${fmt(Number(value ?? 0))}`} />
                            <Legend />
                            <Line type="monotone" dataKey="Total" stroke="#16a34a" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Refacciones" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Servicios" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}