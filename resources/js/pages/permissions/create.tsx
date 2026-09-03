import { Head, Link } from '@inertiajs/react';
import PermissionForm from '@/components/permissions/permission-form';

export default function Create() {
    return (
        <>
            <Head title="Nuevo permiso" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Nuevo permiso
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Registra un nuevo permiso para el sistema.
                            </p>
                        </div>

                        <Link
                            href="/permissions"
                            className="rounded-md border px-4 py-2 text-sm"
                        >
                            Volver
                        </Link>
                    </div>

                    <PermissionForm mode="create" />

                </div>

            </div>
        </>
    );
}

Create.layout = () => ({
    breadcrumbs: [
        {
            title: 'Permisos',
            href: '/permissions',
        },
        {
            title: 'Nuevo permiso',
            href: '#',
        },
    ],
});