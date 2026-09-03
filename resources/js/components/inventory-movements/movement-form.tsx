import { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import ProductSearchSelect, { ProductOption } from '@/components/inventory-movements/product-search-select';

type Branch = { id: number; name: string };
type Product = ProductOption;

type Props = {
    branches: Branch[];
    products: Product[];
    isAdmin: boolean;
    defaultBranchId: number | null;
};

const MOVEMENT_TYPES = [
    { value: 'entry', label: 'Entrada' },
    { value: 'exit', label: 'Salida' },
    { value: 'adjustment', label: 'Ajuste (fija el stock exacto)' },
];

export default function MovementForm({ branches, products, isAdmin, defaultBranchId }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: defaultBranchId ? String(defaultBranchId) : '',
        product_id: '',
        type: 'entry',
        quantity: '',
        reason: '',
        notes: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/inventory-movements', { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Sucursal
                    </label>
                    <select
                        value={data.branch_id}
                        onChange={(e) => setData('branch_id', e.target.value)}
                        disabled={!isAdmin}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isAdmin && <option value="">Selecciona una sucursal</option>}
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    {errors.branch_id && (
                        <p className="mt-1 text-sm text-red-500">{errors.branch_id}</p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Producto / Refacción
                    </label>
                    <ProductSearchSelect
                        products={products}
                        value={data.product_id}
                        onChange={(val) => setData('product_id', val)}
                        error={errors.product_id}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Tipo de movimiento
                    </label>
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                        {MOVEMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && (
                        <p className="mt-1 text-sm text-red-500">{errors.type}</p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        {data.type === 'adjustment'
                            ? 'Nuevo stock (valor exacto)'
                            : 'Cantidad'}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                    />
                    {errors.quantity && (
                        <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Motivo
                </label>
                <input
                    type="text"
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    placeholder="Ej. Compra a proveedor, merma, conteo físico..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
                {errors.reason && (
                    <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
                )}
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">
                    Notas (opcional)
                </label>
                <textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
            </div>

            <div className="flex justify-end border-t pt-6">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    {processing ? 'Guardando...' : 'Registrar movimiento'}
                </button>
            </div>
        </form>
    );
}