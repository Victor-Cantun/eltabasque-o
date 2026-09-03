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

                {/* Encabezado */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Nueva sucursal
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Registra una nueva sucursal en el sistema.
                        </p>
                    </div>

                    <Link
                        href={`/branches`}
                        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        ← Regresar
                    </Link>

                </div>

                {/* Formulario */}
                <div className="max-w-3xl rounded-xl border p-6">

                    <BranchForm
                        //currentTeam={currentTeam}
                        mode="create"
                    />

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
