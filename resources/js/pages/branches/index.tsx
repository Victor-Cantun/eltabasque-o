import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Eye, Pencil, Trash } from 'lucide-react';
type Branch = {
    id: number;
    name: string;
    code: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    active: boolean;
    users_count: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedBranches = {
    data: Branch[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
};

type Props = {
    branches: PaginatedBranches;

    filters: {
        search?: string;
    };

/*     currentTeam?: {
        slug: string;
    }; */
};

export default function Index({
    branches,
    filters,
    //currentTeam,
}: Props) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    /*
     * Búsqueda automática.
     *
     * Esperamos 400ms después de que el usuario
     * deja de escribir antes de consultar Laravel.
     */
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                `/branches`,
                {
                    search,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    /**
     * Limpiar búsqueda.
     */
    function clearSearch() {
        setSearch('');

        router.get(
            `/branches`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    /**
     * Activar / desactivar sucursal.
     */
    function toggleActive(branch: Branch) {
        const action = branch.active
            ? 'desactivar'
            : 'activar';

        if (
            !confirm(
                `¿Deseas ${action} la sucursal "${branch.name}"?`,
            )
        ) {
            return;
        }

        router.post(
            `/branches/${branch.id}/toggle-active`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <>
            <Head title="Sucursales" />

            <div className="flex flex-1 flex-col gap-4 p-4">

                {/* Encabezado */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Sucursales
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Administración de las sucursales
                        </p>
                    </div>

                    <Link
                        href={`/branches/create`}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        + Nueva sucursal
                    </Link>

                </div>

                {/* Buscador */}
                <div className="rounded-xl border p-4">

                    <div className="flex flex-col gap-2 sm:flex-row">

                        <div className="flex-1">

                            <label
                                htmlFor="search"
                                className="text-sm font-medium"
                            >
                                Buscar sucursal
                            </label>

                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Nombre, código, teléfono o correo..."
                                className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                            />

                        </div>

                        <div className="flex items-end">

                            <button
                                type="button"
                                onClick={clearSearch}
                                disabled={!search}
                                className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Limpiar
                            </button>

                        </div>

                    </div>

                </div>

                {/* Tabla */}
                <div className="overflow-hidden rounded-xl border">

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="border-b bg-blue-800 text-white">

                                <tr>

                                    <th className="px-4 py-3 text-left">
                                        Sucursal
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Código
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Teléfono
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Correo
                                    </th>

                                    <th className="px-4 py-3 text-center">
                                        Empleados
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

                                {branches.data.map((branch) => (

                                    <tr
                                        key={branch.id}
                                        className="border-b last:border-0 hover:bg-muted/30"
                                    >

                                        {/* Sucursal */}
                                        <td className="px-4 py-3">

                                            <div className="font-medium">
                                                {branch.name}
                                            </div>

                                            {branch.address && (
                                                <div className="text-xs text-muted-foreground">
                                                    {branch.address}
                                                </div>
                                            )}

                                        </td>

                                        {/* Código */}
                                        <td className="px-4 py-3 font-mono">
                                            {branch.code}
                                        </td>

                                        {/* Teléfono */}
                                        <td className="px-4 py-3">
                                            {branch.phone ?? '—'}
                                        </td>

                                        {/* Email */}
                                        <td className="px-4 py-3">
                                            {branch.email ?? '—'}
                                        </td>

                                        {/* Empleados */}
                                        <td className="px-4 py-3 text-center">
                                            {branch.users_count}
                                        </td>

                                        {/* Estado */}
                                        <td className="px-4 py-3 text-center">

                                            {branch.active ? (
                                                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700">
                                                    Activa
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700">
                                                    Inactiva
                                                </span>
                                            )}

                                        </td>

                                        {/* Acciones */}
                                        <td className="px-4 py-3">

                                            <div className="flex justify-end gap-2">

                                                {/* <Link
                                                    href={`/branches/${branch.id}/edit`}
                                                    className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                                                >
                                                    Editar
                                                </Link> */}
                                                <Link href={`/branches/${branch.id}/edit`} className="hover:cursor-pointer hover:bg-blue-300 rounded-md border px-3 py-1.5 text-xs">
                                                    <Pencil className="h-4 w-4 text-blue-800" />
                                                </Link>
                                                {/* <Link className="hover:cursor-pointer rounded-md border px-3 py-1.5 text-xs">
                                                    <Trash className="h-4 w-4 text-red-600" />
                                                </Link>    */}                                              

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleActive(
                                                            branch,
                                                        )
                                                    }
                                                    className={`rounded-md px-3 py-1.5 text-xs ${
                                                        branch.active
                                                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                                            : 'border border-green-200 text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {branch.active
                                                        ? 'Desactivar'
                                                        : 'Activar'}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                                {/* Sin resultados */}
                                {branches.data.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center"
                                        >

                                            <div className="text-muted-foreground">
                                                No se encontraron
                                                sucursales.
                                            </div>

                                            {search && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        clearSearch
                                                    }
                                                    className="mt-2 text-sm text-primary hover:underline"
                                                >
                                                    Limpiar búsqueda
                                                </button>
                                            )}

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* Paginación */}
                {branches.last_page > 1 && (

                    <div className="flex flex-wrap justify-center gap-1">

                        {branches.links.map(
                            (link, index) => (

                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) {
                                            router.get(
                                                link.url,
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                },
                                            );
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`rounded-md border px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : ''
                                    } ${
                                        !link.url
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'hover:bg-muted'
                                    }`}
                                />

                            ),
                        )}

                    </div>

                )}

            </div>
        </>
    );
}