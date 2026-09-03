import { Head, Link } from '@inertiajs/react';
import RoleForm from '@/components/roles/role-form';

type Permission = {
    id: number;
    name: string;
    slug: string;
};

type Props = {
    permissions: Record<string, Permission[]>;
};

export default function Create({
    permissions,
}: Props) {
    return (
        <>
            <Head title="Nuevo rol" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">

                    <div className="mb-6 flex items-center justify-between">

                        <div>
                            <h1 className="text-2xl font-bold">
                                Nuevo rol
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Crea un rol y asigna los permisos
                                correspondientes.
                            </p>
                        </div>

                        <Link
                            href="/roles"
                            className="rounded-md border px-4 py-2 text-sm"
                        >
                            Volver
                        </Link>

                    </div>

                    <RoleForm
                        permissions={permissions}
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
            title: 'Roles',
            href: '/roles',
        },
        {
            title: 'Nuevo rol',
            href: '#',
        },
    ],
});