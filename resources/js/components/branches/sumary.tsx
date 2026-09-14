// resources/js/components/branches/sumary.tsx
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Branch = { id: number; name: string; code: string };

type Summary = {
    parts_income: number;
    service_income: number;
    total_income: number;
};

type Props = {
    branch: Branch;
    summary?: Summary;
    loading?: boolean;
};

const COLORS = ['#3b82f6', '#f59e0b']; // refacciones, servicio

const fmt = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Sumary({ branch, summary, loading }: Props) {
    const hasData = summary && summary.total_income > 0;

    const chartData = summary
        ? [
              { name: 'Refacciones', value: summary.parts_income },
              { name: 'Servicio', value: summary.service_income },
          ]
        : [];

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-sidebar-border/70 p-3 dark:border-sidebar-border">
            {/* Tarjetas de totales */}
            {loading ? (
                <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
                    Cargando...
                </div>
            ) : (
                <>
                    <div className="rounded-lg bg-muted/40 px-3 py-2 text-center">
                        <p className="text-xs text-muted-foreground">Total ingresos</p>
                        <p className="text-lg font-bold">${fmt(summary?.total_income ?? 0)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border px-2 py-1.5 text-center">
                            <span
                                className="mb-0.5 block h-1.5 w-full rounded-full"
                                style={{ backgroundColor: COLORS[0] }}
                            />
                            <p className="text-xs text-muted-foreground">Refacciones</p>
                            <p className="text-sm font-semibold">${fmt(summary?.parts_income ?? 0)}</p>
                        </div>
                        <div className="rounded-lg border px-2 py-1.5 text-center">
                            <span
                                className="mb-0.5 block h-1.5 w-full rounded-full"
                                style={{ backgroundColor: COLORS[1] }}
                            />
                            <p className="text-xs text-muted-foreground">Servicios</p>
                            <p className="text-sm font-semibold">${fmt(summary?.service_income ?? 0)}</p>
                        </div>
                    </div>

                    {/* Gráfico de dona */}
                    <div className="h-32">
                        {hasData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={30}
                                        outerRadius={50}
                                        paddingAngle={2}
                                    >
                                        {chartData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => `$${fmt(Number(value ?? 0))}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Sin ingresos en el rango
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}