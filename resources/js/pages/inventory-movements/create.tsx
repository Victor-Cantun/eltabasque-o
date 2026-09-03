// resources/js/pages/inventory-movements/create.tsx

import { Head, Link } from '@inertiajs/react';
import MovementForm from '@/components/inventory-movements/movement-form';

type Props = {
    branches: { id: number; name: string }[];
    products: { id: number; name: string; sku: string; barcode?: string | null }[];
    isAdmin: boolean;
    defaultBranchId: number | null;
};

export default function Create({ branches, products, isAdmin, defaultBranchId }: Props) {
    return (
        <>
            <Head title="Registrar movimiento" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Registrar movimiento</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Entradas, salidas o ajustes de inventario.
                            </p>
                        </div>
                        <Link href="/inventory-movements" className="rounded-md border px-4 py-2 text-sm">
                            Volver
                        </Link>
                    </div>
                    <MovementForm
                        branches={branches}
                        products={products}
                        isAdmin={isAdmin}
                        defaultBranchId={defaultBranchId}
                    />
                </div>
            </div>
        </>
    );
}