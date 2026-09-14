// resources/js/pages/inventory-movements/create.tsx

import { Head, Link } from '@inertiajs/react';
import MovementForm from '@/components/inventory-movements/movement-form';

type Props = {
    branches: { id: number; name: string }[];
    products: { id: number; name: string; internal_code: string; original_code?: string | null }[];
    isAdmin: boolean;
    defaultBranchId: number | null;
};

export default function Create({ branches, products, isAdmin, defaultBranchId }: Props) {
    return (
        <>
            <Head title="Registrar movimiento" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border ">
                    <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                        <div className="">
                            <h1 className="text-2xl font-bold">Registrar movimiento</h1>
                            <p className="mt-1 text-sm text-white">
                                Entradas, salidas o ajustes de inventario.
                            </p>
                        </div>
                        <Link href="/inventory" className="rounded-md border px-4 py-2 text-sm">
                            Volver
                        </Link>
                    </div>
                    <div className="p-6">
                        <MovementForm
                            branches={branches}
                            products={products}
                            isAdmin={isAdmin}
                            defaultBranchId={defaultBranchId}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}