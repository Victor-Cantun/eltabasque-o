// resources/js/pages/inventory/edit.tsx

import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

type Props = {
    inventory: {
        id: number;
        stock: string;
        minimum_stock: string;
        branch: { name: string };
        product: { name: string; sku: string };
    };
};

export default function Edit({ inventory }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        minimum_stock: inventory.minimum_stock,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(`/inventory/${inventory.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Editar stock mínimo" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {inventory.product.name}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {inventory.branch.name} — Stock actual: {inventory.stock}
                            </p>
                        </div>
                        <Link href="/inventory" className="rounded-md border px-4 py-2 text-sm">
                            Volver
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Stock mínimo (umbral de alerta)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.minimum_stock}
                                onChange={(e) => setData('minimum_stock', e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                            />
                            {errors.minimum_stock && (
                                <p className="mt-1 text-sm text-red-500">{errors.minimum_stock}</p>
                            )}
                        </div>

                        <div className="flex justify-end border-t pt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                {processing ? 'Guardando...' : 'Actualizar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}