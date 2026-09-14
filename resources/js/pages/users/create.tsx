import { Head, Link } from '@inertiajs/react';
import UserForm from '@/components/users/user-form';
import { RollerCoaster } from 'lucide-react';

type Props = {
    branches: {
        id: number;
        name: string;
        code:string;
    }[];
    roles:{
        id:number;
        name:string;
        slug:string;
    }[];
};
export default function Create({branches,roles,}: Props) {
    return (
        <>
            <Head title="Nuevo usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border ">
                    <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Nuevo usuario
                            </h1>
                            <p className="mt-1 text-sm text-white">
                                Registra un nuevo empleado y asígnalo a una o más sucursales.
                            </p>
                        </div>
                        <Link href={`/users`} className="rounded-md border px-4 py-2 text-sm">
                            Volver
                        </Link>
                    </div>
                    <div className="p-6">
                        <UserForm branches={branches} roles={roles} mode="create" />
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = () => ({
    breadcrumbs: [
        {
            title: 'Usuarios',
            href: '/users',
        },
        {
            title: 'Nuevo usuario',
            href: '#',
        },
    ],
});