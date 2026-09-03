import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Printer, XCircle, Building2, User, Calendar, Tag, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { can } from '@/lib/permissions';

type PriceType = {
    id: number;
    name: string;
    slug: string;
};

type Product = {
    id: number;
    sku: string;
    barcode?: string | null;
    name: string;
};

type Mechanic = {
    id: number;
    name: string;
};

type SaleItem = {
    id: number;
    item_type?: 'product' | 'service';
    quantity: string | number;
    unit_cost: string | number;
    unit_price: string | number;
    discount: string | number;
    subtotal: string | number;
    total: string | number;
    description?: string | null;
    product?: Product | null;
    mechanic?: Mechanic | null;
    priceType?: PriceType | null;
};

type Branch = {
    id: number;
    name: string;
    code: string;
    address?: string;
    phone?: string;
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
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
    created_at: string;
    branch: Branch;
    user: { id: number; name: string; email: string };
    customer?: { id: number; name: string; phone?: string; email?: string; address?: string } | null;
    cancelledBy?: { id: number; name: string } | null;
    items: SaleItem[];
};

type Props = {
    sale: Sale;
};

export default function Show({ sale }: Props) {
    const { auth } = usePage().props as any;
    const userPermissions = auth?.permissions ?? [];
    const [showCancelModal, setShowCancelModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        reason: '',
    });

    const handleCancelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/sales/${sale.id}/cancel`, {
            onSuccess: () => {
                setShowCancelModal(false);
                reset();
            },
        });
    };

    return (
        <>
            <Head title={`Venta ${sale.folio}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                {/* Botón regresar y acciones top */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/sales"
                            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="size-4" />
                            Volver a Lista de Ventas
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">Folio: {sale.folio}</h1>
                                {sale.status === 'completed' ? (
                                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                                        Completada
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">Cancelada</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Registrada el {new Date(sale.created_at).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.print()}
                            className="gap-1.5 text-xs font-semibold"
                        >
                            <Printer className="size-4" />
                            Imprimir Ticket
                        </Button>

                        {sale.status === 'completed' && can(userPermissions, 'sales.cancel') && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowCancelModal(true)}
                                className="gap-1.5 text-xs font-semibold"
                            >
                                <XCircle className="size-4" />
                                Cancelar Venta
                            </Button>
                        )}
                    </div>
                </div>

                {/* Banner de Cancelación si aplica */}
                {sale.status === 'cancelled' && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
                        <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-sm">Venta Cancelada</h3>
                            <p className="text-xs mt-0.5">
                                Cancelada por <span className="font-semibold">{sale.cancelledBy?.name ?? 'Usuario'}</span> el{' '}
                                {sale.cancelled_at && new Date(sale.cancelled_at).toLocaleString('es-MX')}
                            </p>
                            {sale.cancellation_reason && (
                                <p className="text-xs italic mt-1 font-medium bg-background/50 p-2 rounded border">
                                    Motivo: "{sale.cancellation_reason}"
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Detalle Ticket / Resumen de Encabezado */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {/* Sucursal */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Building2 className="size-4 text-primary" />
                            Sucursal de Venta
                        </div>
                        <div className="text-base font-bold">{sale.branch.name}</div>
                        {sale.branch.address && <div className="text-xs text-muted-foreground">{sale.branch.address}</div>}
                    </div>

                    {/* Vendedor / Cajero */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <User className="size-4 text-primary" />
                            Cajero / Atendido por
                        </div>
                        <div className="text-base font-bold">{sale.user.name}</div>
                        <div className="text-xs text-muted-foreground">{sale.user.email}</div>
                    </div>

                    {/* Cliente */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <User className="size-4 text-primary" />
                            Cliente
                        </div>
                        <div className="text-base font-bold">{sale.customer?.name ?? 'Público general'}</div>
                        {sale.customer?.phone && <div className="text-xs text-muted-foreground">Tel: {sale.customer.phone}</div>}
                    </div>
                </div>

                {/* Tabla de Productos y Servicios de la Venta */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="p-4 border-b bg-muted/40 font-bold text-sm text-foreground flex items-center justify-between">
                        <span>Conceptos de la Venta ({sale.items.length})</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/60 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left">SKU / Tipo</th>
                                    <th className="px-4 py-3 text-left">Descripción</th>
                                    <th className="px-4 py-3 text-left">Mecánico / Precio</th>
                                    <th className="px-4 py-3 text-right">Cant.</th>
                                    <th className="px-4 py-3 text-right">P. Unitario</th>
                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sale.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3 font-mono text-xs font-semibold">
                                            {item.product ? (
                                                <Badge variant="secondary" className="font-mono text-[11px]">
                                                    SKU: {item.product.sku}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 text-[11px] font-semibold gap-1">
                                                    <Wrench className="size-3" />
                                                    Servicio
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-foreground">
                                                {item.product ? item.product.name : (item.description || 'Servicio / Mano de obra')}
                                            </div>
                                            {item.product?.barcode && (
                                                <div className="text-[10px] text-muted-foreground">Cód: {item.product.barcode}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.product ? (
                                                <Badge variant="outline" className="text-xs font-medium gap-1">
                                                    <Tag className="size-3 text-primary" />
                                                    {item.priceType?.name ?? 'Público'}
                                                </Badge>
                                            ) : item.mechanic ? (
                                                <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-100/70 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                                    <Wrench className="size-3" />
                                                    {item.mechanic.name}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Sin mecánico asignado</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold">{Number(item.quantity)}</td>
                                        <td className="px-4 py-3 text-right">${Number(item.unit_price).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-foreground">
                                            ${Number(item.total).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Resumen Total con Desglose */}
                    <div className="border-t bg-muted/20 p-4 flex flex-col items-end gap-1.5 text-sm">
                        <div className="flex justify-between w-full max-w-xs text-muted-foreground text-xs">
                            <span>Total Refacciones:</span>
                            <span className="font-semibold text-foreground">
                                ${Number(sale.products_total ?? 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between w-full max-w-xs text-muted-foreground text-xs">
                            <span>Total Servicios (Mano de obra):</span>
                            <span className="font-semibold text-amber-600">
                                ${Number(sale.service_total ?? 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between w-full max-w-xs text-muted-foreground border-t pt-1">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-foreground">${Number(sale.subtotal).toFixed(2)}</span>
                        </div>
                        {Number(sale.discount) > 0 && (
                            <div className="flex justify-between w-full max-w-xs text-emerald-600 font-medium text-xs">
                                <span>Descuento:</span>
                                <span>-${Number(sale.discount).toFixed(2)}</span>
                            </div>
                        )}
                        {Number(sale.tax) > 0 && (
                            <div className="flex justify-between w-full max-w-xs text-muted-foreground text-xs">
                                <span>Impuesto:</span>
                                <span>+${Number(sale.tax).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between w-full max-w-xs border-t pt-2 text-lg font-bold text-foreground">
                            <span>TOTAL:</span>
                            <span className="text-primary">${Number(sale.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Modal de Cancelación de Venta */}
                {showCancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
                                <AlertTriangle className="size-5" />
                                Confirmar Cancelación de Venta
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Al cancelar la venta <strong>{sale.folio}</strong>, los productos vendidos volverán a sumarse al inventario de la sucursal <strong>{sale.branch.name}</strong>.
                            </p>

                            <form onSubmit={handleCancelSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                        Motivo de cancelación <span className="text-destructive">*</span>
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Ej: Error en el cobro, el cliente solicitó devolución..."
                                        className="w-full rounded-md border bg-background p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-destructive"
                                    />
                                    {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason}</p>}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCancelModal(false)}
                                        className="text-xs"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                        className="text-xs font-bold"
                                    >
                                        {processing ? 'Cancelando...' : 'Confirmar Cancelación'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
