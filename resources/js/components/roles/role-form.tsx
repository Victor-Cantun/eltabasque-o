import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Permission = {
    id: number;
    name: string;
    slug: string;
};

type PermissionsByModule = Record<string, Permission[]>;

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    permissions?: Permission[];
};

type Props = {
    permissions: PermissionsByModule;
    role?: Role;
    mode: 'create' | 'edit';
};

export default function RoleForm({
    permissions,
    role,
    mode,
}: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name ?? '',
        slug: role?.slug ?? '',
        description: role?.description ?? '',
        active: role?.active ?? true,

        permissions:
            role?.permissions?.map((permission) => permission.id) ?? [],
    });

    const generateSlug = (value: string) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');
    };

    const handleNameChange = (value: string) => {
        setData((data) => ({
            ...data,
            name: value,
            slug:
                mode === 'create'
                    ? generateSlug(value)
                    : data.slug,
        }));
    };

    const togglePermission = (permissionId: number) => {
        setData(
            'permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId],
        );
    };

    const toggleModule = (
        modulePermissions: Permission[],
    ) => {
        const permissionIds = modulePermissions.map(
            (permission) => permission.id,
        );

        const allSelected = permissionIds.every((id) =>
            data.permissions.includes(id),
        );

        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter(
                    (id) => !permissionIds.includes(id),
                ),
            );
        } else {
            setData(
                'permissions',
                Array.from(
                    new Set([
                        ...data.permissions,
                        ...permissionIds,
                    ]),
                ),
            );
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post('/roles');
            return;
        }

        if (role) {
            put(`/roles/${role.id}`);
        }
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-6"
        >
            {/* Información del rol */}
            <div className="grid gap-6 md:grid-cols-2">

                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium"
                    >
                        Nombre del rol
                    </label>

                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) =>
                            handleNameChange(e.target.value)
                        }
                        className="w-full rounded-md border px-3 py-2"
                        placeholder="Ej. Vendedor"
                    />

                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="slug"
                        className="mb-2 block text-sm font-medium"
                    >
                        Identificador
                    </label>

                    <input
                        id="slug"
                        type="text"
                        value={data.slug}
                        onChange={(e) =>
                            setData('slug', e.target.value)
                        }
                        className="w-full rounded-md border px-3 py-2"
                        placeholder="Ej. vendedor"
                    />

                    <p className="mt-1 text-xs text-muted-foreground">
                        Identificador interno del rol.
                    </p>

                    {errors.slug && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.slug}
                        </p>
                    )}
                </div>

            </div>

            {/* Descripción */}
            <div>
                <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium"
                >
                    Descripción
                </label>

                <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) =>
                        setData(
                            'description',
                            e.target.value,
                        )
                    }
                    rows={3}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="Describe las funciones de este rol"
                />

                {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.description}
                    </p>
                )}
            </div>

            {/* Estado */}
            <div className="flex items-center gap-3">

                <input
                    id="active"
                    type="checkbox"
                    checked={data.active}
                    onChange={(e) =>
                        setData(
                            'active',
                            e.target.checked,
                        )
                    }
                    className="size-4"
                />

                <label
                    htmlFor="active"
                    className="text-sm font-medium"
                >
                    Rol activo
                </label>

            </div>

            {/* Permisos */}
            <div>

                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Permisos
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Selecciona las acciones que podrá realizar
                        este rol.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                    {Object.entries(permissions).map(
                        ([module, modulePermissions]) => {

                            const allSelected =
                                modulePermissions.every(
                                    (permission) =>
                                        data.permissions.includes(
                                            permission.id,
                                        ),
                                );

                            return (
                                <div
                                    key={module}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="mb-4 flex items-center justify-between">

                                        <h3 className="font-semibold">
                                            {module ?? 'General'}
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleModule(
                                                    modulePermissions,
                                                )
                                            }
                                            className="text-sm underline"
                                        >
                                            {allSelected
                                                ? 'Quitar todos'
                                                : 'Seleccionar todos'}
                                        </button>

                                    </div>

                                    <div className="space-y-3">

                                        {modulePermissions.map(
                                            (permission) => (
                                                <label
                                                    key={
                                                        permission.id
                                                    }
                                                    className="flex cursor-pointer items-center gap-3"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={data.permissions.includes(
                                                            permission.id,
                                                        )}
                                                        onChange={() =>
                                                            togglePermission(
                                                                permission.id,
                                                            )
                                                        }
                                                        className="size-4"
                                                    />

                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                permission.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                permission.slug
                                                            }
                                                        </p>
                                                    </div>
                                                </label>
                                            ),
                                        )}

                                    </div>
                                </div>
                            );
                        },
                    )}

                </div>

                {errors.permissions && (
                    <p className="mt-2 text-sm text-red-500">
                        {errors.permissions}
                    </p>
                )}

            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">

                <a
                    href="/roles"
                    className="rounded-md border px-4 py-2 text-sm"
                >
                    Cancelar
                </a>

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    {processing
                        ? 'Guardando...'
                        : mode === 'create'
                          ? 'Crear rol'
                          : 'Guardar cambios'}
                </button>

            </div>
        </form>
    );
}