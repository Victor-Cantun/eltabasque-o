import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash } from 'lucide-react';

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    permissions_count: number;
};

type Props = {
    roles: {
        data: Role[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
};

export default function Index({
    roles,
}: Props) {

    const deleteRole = (role: Role) => {
        if (
            confirm(
                `¿Deseas eliminar el rol "${role.name}"?`,
            )
        ) {
            router.delete(`/roles/${role.id}`);
        }
    };

    return (
        <>
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">

                    {/* Encabezado */}
                    <div className="mb-6 flex items-center justify-between">

                        <div>
                            <h1 className="text-2xl font-bold">
                                Roles
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Administra los roles y permisos
                                del sistema.
                            </p>
                        </div>

                        <Link
                            href="/roles/create"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            + Nuevo rol
                        </Link>

                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead className="border-b bg-blue-800 text-white">

                                <tr>
                                    <th className="px-4 py-3">
                                        Nombre
                                    </th>

                                    <th className="px-4 py-3">
                                        Identificador
                                    </th>

                                    <th className="px-4 py-3">
                                        Descripción
                                    </th>

                                    <th className="px-4 py-3 text-center">
                                        Permisos
                                    </th>

                                    <th className="px-4 py-3 text-center">
                                        Estado
                                    </th>

                                    <th className="px-4 py-3 text-right">
                                        Acciones
                                    </th>
                                </tr>

                            </thead>

                            <tbody>

                                {roles.data.map(
                                    (role) => (
                                        <tr
                                            key={role.id}
                                            className="border-b"
                                        >
                                            <td className="px-4 py-4 font-medium">
                                                {role.name}
                                            </td>

                                            <td className="px-4 py-4">
                                                <code className="rounded bg-muted px-2 py-1 text-xs">
                                                    {role.slug}
                                                </code>
                                            </td>

                                            <td className="px-4 py-4 text-muted-foreground">
                                                {role.description ??
                                                    '-'}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                {role.permissions_count}
                                            </td>

                                            <td className="px-4 py-4 text-center">

                                                {role.active ? (
                                                    <span className="rounded-full border px-2 py-1 text-xs">
                                                        Activo
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                                                        Inactivo
                                                    </span>
                                                )}

                                            </td>

                                            <td className="px-4 py-4">

                                                <div className="flex justify-end gap-2">

                                                    {/* <Link
                                                        href={`/roles/${role.id}/edit`}
                                                        className="rounded-md border px-3 py-1.5 text-xs"
                                                    >
                                                        Editar
                                                    </Link> */}
                                                    <Link href={`/roles/${role.id}/edit`} className="hover:cursor-pointer hover:bg-blue-300 rounded-md border px-3 py-1.5 text-xs">
                                                        <Pencil className="h-4 w-4 text-blue-800" />
                                                    </Link> 

                                                    {/* <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteRole(
                                                                role,
                                                            )
                                                        }
                                                        className="rounded-md border px-3 py-1.5 text-xs"
                                                    >
                                                        Eliminar
                                                    </button> */}

                                                </div>

                                            </td>
                                        </tr>
                                    ),
                                )}

                                {roles.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No hay roles registrados.
                                        </td>
                                    </tr>
                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* Paginación */}
                    {roles.links.length > 3 && (

                        <div className="mt-6 flex flex-wrap gap-2">

                            {roles.links.map(
                                (link, index) => {

                                    if (
                                        link.url === null
                                    ) {
                                        return (
                                            <span
                                                key={index}
                                                className="rounded-md border px-3 py-2 text-sm opacity-50"
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        link.label,
                                                }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`rounded-md border px-3 py-2 text-sm ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : ''
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    link.label,
                                            }}
                                        />
                                    );
                                },
                            )}

                        </div>
                    )}

                </div>

            </div>
        </>
    );
}

Index.layout = () => ({
    breadcrumbs: [
        {
            title: 'Roles',
            href: '/roles',
        },
    ],
});