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
                <div className="rounded-xl border ">
                    {/* Encabezado */}
                    <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Nuevo mecánico
                            </h1>
                            <p className="text-sm text-white">
                                Registra un nuevo mecánico en el sistema y asígnalo a sus sucursales.
                            </p>
                        </div>
                        <Link href={`/mechanics`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                            ← Regresar
                        </Link>
                    </div>
                    {/* Formulario */}
                    <div className="p-6">
                        <MechanicForm branches={branches} mode="create" />
                    </div>
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
