import { Head, Link } from '@inertiajs/react';
import MechanicForm from '@/components/mechanics/mechanic-form';

type Branch = {
    id: number;
    name: string;
    code: string;
    is_primary?: boolean;
};

type Mechanic = {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    active: boolean;
    branches: Branch[];
};

type Props = {
    mechanic: Mechanic;
    branches: Branch[];
};

export default function Edit({ mechanic, branches = [] }: Props) {
    return (
        <>
            <Head title={`Editar ${mechanic.name}`} />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {/* Encabezado */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Editar mecánico
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Modifica la información y sucursales asignadas a{' '}
                            <strong>{mechanic.name}</strong>.
                        </p>
                    </div>
                    <Link href={`/mechanics`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                        ← Regresar
                    </Link>
                </div>
                {/* Formulario */}
                <div className="max-w-3xl rounded-xl border p-6">
                    <MechanicForm mechanic={mechanic} branches={branches} mode="edit" />
                </div>
            </div>
        </>
    );
}
Edit.layout = () => ({
    breadcrumbs: [
        {
            title: 'Mecánicos',
            href: '/mechanics',
        },
        {
            title: 'Editar mecánico',
            href: '#',
        },
    ],
});