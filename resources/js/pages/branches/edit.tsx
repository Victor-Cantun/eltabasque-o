import { Head, Link } from '@inertiajs/react';
import BranchForm from '@/components/branches/branch-form';

type Branch = {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    active: boolean;
};

type Props = {
    branch: Branch;
/*     currentTeam?: {
        slug: string;
    }; */
};

export default function Edit({
    branch,
    //currentTeam,
}: Props) {
    return (
        <>
            <Head title={`Editar ${branch.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">

                {/* Encabezado */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Editar sucursal
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Modifica la información de{' '}
                            <strong>{branch.name}</strong>.
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
                        branch={branch}
                        //currentTeam={currentTeam}
                        mode="edit"
                    />

                </div>

            </div>
        </>
    );
}
Edit.layout = () => ({
    breadcrumbs: [
        {
            title: 'Sucursales',
            href: '/branches',
        },
        {
            title: 'Editar sucursal',
            href: '#',
        },
    ],
});