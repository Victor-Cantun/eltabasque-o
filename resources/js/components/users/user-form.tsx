import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Branch = {
    id: number;
    name: string;
    code: string;
};

type Role = {
    id: number;
    name: string;
    slug: string;
};

type User = {
    id: number;
    name: string;
    email: string;

    branches: {
        id: number;
        name: string;
        code: string;
        is_primary: boolean;
    }[];

    roles: number[];
};

type Props = {
    branches: Branch[];
    roles: Role[];

    user?: User;

    mode: 'create' | 'edit';
};

export default function UserForm({
    branches,
    roles,
    user,
    mode,
}: Props) {
    const selectedBranches = user
        ? user.branches.map((branch) => branch.id)
        : [];

    const primaryBranch = user
        ? user.branches.find(
              (branch) => branch.is_primary,
          )?.id ?? ''
        : '';

    const { data, setData, post, put, processing, errors } =
        useForm({
            name: user?.name ?? '',
            email: user?.email ?? '',

            password: '',
            password_confirmation: '',

            branches: selectedBranches,

            primary_branch_id: primaryBranch,

            roles: user?.roles ?? [],
        });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (mode === 'create') {
            post('/users');
            return;
        }

        if (user) {
            put(`/users/${user.id}`);
        }
    };

    const toggleBranch = (branchId: number) => {
        const exists = data.branches.includes(branchId);

        if (exists) {
            const updatedBranches =
                data.branches.filter(
                    (id) => id !== branchId,
                );

            setData('branches', updatedBranches);

            if (
                data.primary_branch_id === branchId
            ) {
                setData(
                    'primary_branch_id',
                    '',
                );
            }

            return;
        }

        setData('branches', [
            ...data.branches,
            branchId,
        ]);
    };

    const toggleRole = (roleId: number) => {
        const exists =
            data.roles.includes(roleId);

        if (exists) {
            setData(
                'roles',
                data.roles.filter(
                    (id) => id !== roleId,
                ),
            );

            return;
        }

        setData('roles', [
            ...data.roles,
            roleId,
        ]);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* ========================= */}
            {/* INFORMACIÓN DEL USUARIO */}
            {/* ========================= */}

            <div className="space-y-4">

                <div>
                    <label className="text-sm font-medium">
                        Nombre
                    </label>

                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) =>
                            setData(
                                'name',
                                e.target.value,
                            )
                        }
                        className="mt-1 w-full rounded-md border px-3 py-2"
                    />

                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium">
                        Correo electrónico
                    </label>

                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) =>
                            setData(
                                'email',
                                e.target.value,
                            )
                        }
                        className="mt-1 w-full rounded-md border px-3 py-2"
                    />

                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.email}
                        </p>
                    )}
                </div>

            </div>

            {/* ========================= */}
            {/* CONTRASEÑA */}
            {/* ========================= */}

            <div className="rounded-lg border p-4">

                <h2 className="mb-4 text-lg font-semibold">
                    Contraseña
                </h2>

                {mode === 'edit' && (
                    <p className="mb-4 text-sm text-muted-foreground">
                        Deja estos campos vacíos si no deseas cambiar
                        la contraseña.
                    </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">

                    <div>
                        <label className="text-sm font-medium">
                            Contraseña
                        </label>

                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData(
                                    'password',
                                    e.target.value,
                                )
                            }
                            className="mt-1 w-full rounded-md border px-3 py-2"
                        />

                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Confirmar contraseña
                        </label>

                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                    </div>

                </div>

            </div>

            {/* ========================= */}
            {/* SUCURSALES */}
            {/* ========================= */}

            <div className="rounded-lg border p-4">

                <h2 className="mb-2 text-lg font-semibold">
                    Sucursales asignadas
                </h2>

                <p className="mb-4 text-sm text-muted-foreground">
                    Selecciona las sucursales a las que tendrá acceso
                    este usuario.
                </p>

                <div className="space-y-3">

                    {branches.map((branch) => (

                        <label
                            key={branch.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md border p-3"
                        >

                            <input
                                type="checkbox"
                                checked={
                                    data.branches.includes(
                                        branch.id,
                                    )
                                }
                                onChange={() =>
                                    toggleBranch(
                                        branch.id,
                                    )
                                }
                            />

                            <div>
                                <div className="font-medium">
                                    {branch.name}
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    Código: {branch.code}
                                </div>
                            </div>

                        </label>

                    ))}

                </div>

                {errors.branches && (
                    <p className="mt-2 text-sm text-red-500">
                        {errors.branches}
                    </p>
                )}

            </div>

            {/* ========================= */}
            {/* SUCURSAL PRINCIPAL */}
            {/* ========================= */}

            <div className="rounded-lg border p-4">

                <h2 className="mb-2 text-lg font-semibold">
                    Sucursal principal
                </h2>

                <p className="mb-4 text-sm text-muted-foreground">
                    Esta sucursal será utilizada como sucursal
                    principal del empleado.
                </p>

                <select
                    value={data.primary_branch_id}
                    onChange={(e) =>
                        setData(
                            'primary_branch_id',
                            e.target.value
                                ? Number(
                                      e.target.value,
                                  )
                                : '',
                        )
                    }
                    className="w-full rounded-md border px-3 py-2"
                >

                    <option value="">
                        Selecciona una sucursal
                    </option>

                    {branches
                        .filter((branch) =>
                            data.branches.includes(
                                branch.id,
                            ),
                        )
                        .map((branch) => (

                            <option
                                key={branch.id}
                                value={branch.id}
                            >
                                {branch.name}
                            </option>

                        ))}

                </select>

                {errors.primary_branch_id && (
                    <p className="mt-2 text-sm text-red-500">
                        {errors.primary_branch_id}
                    </p>
                )}

            </div>

            {/* ========================= */}
            {/* ROLES */}
            {/* ========================= */}

            <div className="rounded-lg border p-4">

                <h2 className="mb-2 text-lg font-semibold">
                    Roles del usuario
                </h2>

                <p className="mb-4 text-sm text-muted-foreground">
                    Selecciona uno o varios roles para este usuario.
                    Los permisos se obtendrán a partir de los roles
                    asignados.
                </p>

                <div className="grid gap-3 md:grid-cols-2">

                    {roles.map((role) => (

                        <label
                            key={role.id}
                            className="flex cursor-pointer items-start gap-3 rounded-md border p-4 transition hover:bg-muted"
                        >

                            <input
                                type="checkbox"
                                checked={
                                    data.roles.includes(
                                        role.id,
                                    )
                                }
                                onChange={() =>
                                    toggleRole(
                                        role.id,
                                    )
                                }
                                className="mt-1"
                            />

                            <div>

                                <div className="font-medium">
                                    {role.name}
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    {role.slug}
                                </div>

                            </div>

                        </label>

                    ))}

                </div>

                {errors.roles && (
                    <p className="mt-2 text-sm text-red-500">
                        {errors.roles}
                    </p>
                )}

            </div>

            {/* ========================= */}
            {/* BOTÓN */}
            {/* ========================= */}

            <div className="flex justify-end">

                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    {processing
                        ? 'Guardando...'
                        : mode === 'create'
                          ? 'Crear usuario'
                          : 'Actualizar usuario'}
                </button>

            </div>

        </form>
    );
}