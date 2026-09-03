import { Head, Link } from '@inertiajs/react';
import RoleForm from '@/components/roles/role-form';

type Permission = {
    id: number;
    name: string;
    slug: string;
};

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    permissions: Permission[];
};

type Props = {
    role: Role;
    permissions: Record<string, Permission[]>;
};

export default function Edit({
    role,
    permissions,
}: Props) {
    return (
        <>
            <Head title={`Editar ${role.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">

                    <div className="mb-6 flex items-center justify-between">

                        <div>
                            <h1 className="text-2xl font-bold">
                                Editar rol
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Modifica la información y permisos
                                del rol {role.name}.
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
                        role={role}
                        permissions={permissions}
                        mode="edit"
                    />

                </div>

            </div>
        </>
    );
}

Edit.layout = (props: {
    role: Role;
}) => ({
    breadcrumbs: [
        {
            title: 'Roles',
            href: '/roles',
        },
        {
            title: props.role.name,
            href: '#',
        },
    ],
});