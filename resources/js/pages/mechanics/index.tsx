import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Eye, Pencil, Trash } from 'lucide-react';
type Branch = {
    id: number;
    name: string;
    code: string;
    pivot?: {
        is_primary: boolean;
    };
};

type Mechanic = {
    id: number;
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    active: boolean;
    branches?: Branch[];
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedMechanics = {
    data: Mechanic[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
};

type Props = {
    mechanics: PaginatedMechanics;

    filters: {
        search?: string;
    };
};

export default function Index({ mechanics, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                `/mechanics`,
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
            `/mechanics`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    /**
     * Activar / desactivar mecánico.
     */
    function toggleActive(mechanic: Mechanic) {
        const action = mechanic.active
            ? 'desactivar'
            : 'activar';

        if (
            !confirm(
                `¿Deseas ${action} el mecánico "${mechanic.name}"?`,
            )
        ) {
            return;
        }

        router.post(
            `/mechanics/${mechanic.id}/toggle-active`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <>
            <Head title="Mecánicos" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                {/* Encabezado */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Mecánicos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Administración y gestión de mecánicos del taller.
                        </p>
                    </div>
                    <Link
                        href={`/mechanics/create`}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        + Nuevo mecánico
                    </Link>
                </div>
                {/* Buscador */}
                <div className="rounded-xl border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex-1">
                            <label htmlFor="search" className="text-sm font-medium">
                                Buscar mecánico
                            </label>
                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Nombre, teléfono, dirección o correo..."
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
                                    <th className="px-4 py-3 text-left">Mecánico</th>
                                    <th className="px-4 py-3 text-left">Sucursales</th>
                                    <th className="px-4 py-3 text-left">Domicilio</th>
                                    <th className="px-4 py-3 text-left">Teléfono</th>
                                    <th className="px-4 py-3 text-left">Correo</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mechanics.data.map((mechanic) => (
                                    <tr key={mechanic.id} className="border-b last:border-0 hover:bg-muted/30">
                                        {/* Mecánico */}
                                        <td className="px-4 py-3 font-medium">{mechanic.name}</td>
                                        {/* Sucursales */}
                                        <td className="px-4 py-3">
                                            {mechanic.branches && mechanic.branches.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {mechanic.branches.map((branch) => (
                                                        <span
                                                            key={branch.id}
                                                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                                                branch.pivot?.is_primary
                                                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            {branch.name}
                                                            {branch.pivot?.is_primary && ' (Principal)'}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        {/* Domicilio */}
                                        <td className="px-4 py-3">{mechanic.address ?? '—'}</td>
                                        {/* Teléfono */}
                                        <td className="px-4 py-3">{mechanic.phone ?? '—'}</td>
                                        {/* Email */}
                                        <td className="px-4 py-3">{mechanic.email ?? '—'}</td>
                                        {/* Estado */}
                                        <td className="px-4 py-3 text-center">
                                            {mechanic.active ? (
                                                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700">Activo</span>
                                            ) : (
                                                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700">Inactivo</span>
                                            )}
                                        </td>
                                        {/* Acciones */}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                {/* <Link
                                                    href={`/mechanics/${mechanic.id}/edit`}
                                                    className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                                                >
                                                    Editar
                                                </Link> */}
                                                <Link href={`/mechanics/${mechanic.id}/edit`} className="hover:cursor-pointer hover:bg-blue-300 rounded-md border px-3 py-1.5 text-xs">
                                                    <Pencil className="h-4 w-4 text-blue-800" />
                                                </Link>                                                
                                                <button
                                                    type="button"
                                                    onClick={() => toggleActive(mechanic)}
                                                    className={`rounded-md px-3 py-1.5 text-xs ${
                                                        mechanic.active
                                                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                                            : 'border border-green-200 text-green-600 hover:bg-green-50'
                                                    }`}
                                                >
                                                    {mechanic.active ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                 {/* Sin resultados */}
                                {mechanics.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="text-muted-foreground">No se encontraron mecánicos.</div>
                                            {search && (
                                                <button
                                                    type="button"
                                                    onClick={clearSearch}
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
                {mechanics.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-1">
                        {mechanics.links.map(
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