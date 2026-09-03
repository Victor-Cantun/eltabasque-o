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

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Editar permiso
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Modifica la información del permiso.
                            </p>
                        </div>

                        <Link
                            href="/permissions"
                            className="rounded-md border px-4 py-2 text-sm"
                        >
                            Volver
                        </Link>
                    </div>

                    <PermissionForm
                        permission={permission}
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
            title: 'Permisos',
            href: '/permissions',
        },
        {
            title: 'Editar permiso',
            href: '#',
        },
    ],
});