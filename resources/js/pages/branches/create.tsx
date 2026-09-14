import { Head, Link } from '@inertiajs/react';
import BranchForm from '@/components/branches/branch-form';

type Props = {
/*     currentTeam?: {
        slug: string;
    }; */
};

export default function Create() {
    return (
        <>
            <Head title="Nueva sucursal" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="rounded-xl border ">
                    {/* Encabezado */}
                    <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Nueva sucursal
                            </h1>
                            <p className="text-sm text-white">
                                Registra una nueva sucursal en el sistema.
                            </p>
                        </div>
                        <Link href={`/branches`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                            ← Regresar
                        </Link>
                    </div>
                    {/* Formulario */}
                    <div className="p-6">
                        <BranchForm mode="create"/>
                    </div>
                </div>
            </div>
        </>
    );
}
Create.layout = () => ({
    breadcrumbs: [
        {
            title: 'Sucursales',
            href: '/branches',
        },
        {
            title: 'Nueva sucursal',
            href: '#',
        },
    ],
});
