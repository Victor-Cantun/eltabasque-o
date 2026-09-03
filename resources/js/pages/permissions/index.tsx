import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash } from 'lucide-react';
type Permission = {
    id: number;
    name: string;
    slug: string;
    module: string | null;
};

type Props = {
    permissions: Permission[];
};

export default function Index({
    permissions,
}: Props) {
    const deletePermission = (permission: Permission) => {
        if (
            confirm(
                `¿Deseas eliminar el permiso "${permission.name}"?`,
            )
        ) {
            router.delete(`/permissions/${permission.id}`);
        }
    };

    return (
        <>
            <Head title="Permisos" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Permisos
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Administra los permisos disponibles en el sistema.
                            </p>
                        </div>

                        <Link
                            href="/permissions/create"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            + Nuevo permiso
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-blue-800 text-white">
                                <tr className="border-b text-left text-sm ">
                                    <th className="px-4 py-3">
                                        Nombre
                                    </th>

                                    <th className="px-4 py-3">
                                        Identificador
                                    </th>

                                    <th className="px-4 py-3">
                                        Módulo
                                    </th>

                                    <th className="px-4 py-3 text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {permissions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            No hay permisos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    permissions.map((permission) => (
                                        <tr
                                            key={permission.id}
                                            className="border-b"
                                        >
                                            <td className="px-4 py-3">
                                                {permission.name}
                                            </td>

                                            <td className="px-4 py-3">
                                                <code className="rounded bg-muted px-2 py-1 text-xs">
                                                    {permission.slug}
                                                </code>
                                            </td>

                                            <td className="px-4 py-3">
                                                {permission.module ?? '-'}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">

                                                    {/* <Link
                                                        href={`/permissions/${permission.id}/edit`}
                                                        className="rounded-md border px-3 py-1 text-sm"
                                                    >
                                                        Editar
                                                    </Link> */}
                                                    <Link href={`/permissions/${permission.id}/edit`} className="hover:cursor-pointer hover:bg-blue-300 rounded-md border px-3 py-1.5 text-xs">
                                                        <Pencil className="h-4 w-4 text-blue-800" />
                                                    </Link> 
                                                    <Link onClick={() =>deletePermission(permission)} className="hover:cursor-pointer hover:bg-red-300 rounded-md border px-3 py-1.5 text-xs">
                                                        <Trash className="h-4 w-4 text-red-600" />
                                                    </Link>

                                                    {/* <button
                                                        type="button"
                                                        onClick={() =>
                                                            deletePermission(permission)
                                                        }
                                                        className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-500"
                                                    >
                                                        Eliminar
                                                    </button> */}

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </>
    );
}

Index.layout = () => ({
    breadcrumbs: [
        {
            title: 'Permisos',
            href: '/permissions',
        },
    ],
});
