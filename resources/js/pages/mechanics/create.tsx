import { Head, Link } from '@inertiajs/react';
import MechanicForm from '@/components/mechanics/mechanic-form';

type Branch = {
    id: number;
    name: string;
    code: string;
};

type Props = {
    branches: Branch[];
};

export default function Create({ branches = [] }: Props) {
    return (
        <>
            <Head title="Nuevo mecánico" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {/* Encabezado */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Nuevo mecánico
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Registra un nuevo mecánico en el sistema y asígnalo a sus sucursales.
                        </p>
                    </div>
                    <Link href={`/mechanics`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                        ← Regresar
                    </Link>
                </div>
                {/* Formulario */}
                <div className="max-w-3xl rounded-xl border p-6">
                    <MechanicForm branches={branches} mode="create" />
                </div>
            </div>
        </>
    );
}
Create.layout = () => ({
    breadcrumbs: [
        {
            title: 'Mecánicos',
            href: '/mechanics',
        },
        {
            title: 'Nuevo mecánico',
            href: '#',
        },
    ],
});
