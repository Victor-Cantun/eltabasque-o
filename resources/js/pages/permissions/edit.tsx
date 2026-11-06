import { Head, Link } from '@inertiajs/react';
import PermissionForm from '@/components/permissions/permission-form';

type Permission = {
    id: number;
    name: string;
    slug: string;
    module: string | null;
};

type Props = {
    permission: Permission;
};

export default function Edit({
    permission,
}: Props) {
    return (
        <>
            <Head title="Editar permiso" />
            <div className="flex flex-1 flex-col gap-6 p-4 mx-auto">
                <div className="rounded-xl border bg-card">
                    <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Editar permiso
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Modifica la información del permiso.
                            </p>
                        </div>
                        <Link href="/permissions" className="rounded-md border px-4 py-2 text-sm">
                            Volver
                        </Link>
                    </div>
                    <div className="max-w-3xl p-6">
                        <PermissionForm permission={permission} mode="edit" />
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = () => ({
    breadcrumbs: [
        {
            title: 'Permisos',
            href: '/permissions',
        },
        {
            title: 'Editar permiso',
            href: '#',
        },
    ],
});