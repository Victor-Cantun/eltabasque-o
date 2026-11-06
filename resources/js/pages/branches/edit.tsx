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
            <div className="flex flex-1 flex-col gap-6 p-4 mx-auto">
                <div className="rounded-xl border bg-card">
                    {/* Encabezado */}
                    <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Editar sucursal
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Modifica la información de{' '}
                                <strong>{branch.name}</strong>.
                            </p>
                        </div>
                        <Link href={`/branches`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                            ← Regresar
                        </Link>
                    </div>
                    {/* Formulario */}
                    <div className="max-w-3xl p-6">
                        <BranchForm branch={branch} mode="edit"/>
                    </div>
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