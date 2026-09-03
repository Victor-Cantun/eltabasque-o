import { Link, useForm } from '@inertiajs/react';
import React from 'react';

type Branch = {
    id: number;
    name: string;
    code: string;
    is_primary?: boolean;
};

type Mechanic = {
    id?: number;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    active: boolean;
    branches?: Branch[];
};

type MechanicFormProps = {
    branches: Branch[];
    mechanic?: Mechanic;
    mode?: 'create' | 'edit';
};

type MechanicFormData = {
    name: string;
    address: string;
    phone: string;
    email: string;
    active: boolean;
    branches: number[];
    primary_branch_id: number | '';
};

export default function MechanicForm({
    branches = [],
    mechanic,
    mode = 'create',
}: MechanicFormProps) {
    const isEdit = mode === 'edit';

    const selectedBranches = mechanic?.branches
        ? mechanic.branches.map((branch) => branch.id)
        : [];

    const primaryBranch = mechanic?.branches
        ? mechanic.branches.find((branch) => branch.is_primary)?.id ??
          (selectedBranches.length === 1 ? selectedBranches[0] : '')
        : selectedBranches.length === 1
          ? selectedBranches[0]
          : '';

    const form = useForm<MechanicFormData>({
        name: mechanic?.name ?? '',
        address: mechanic?.address ?? '',
        phone: mechanic?.phone ?? '',
        email: mechanic?.email ?? '',
        active: mechanic?.active ?? true,
        branches: selectedBranches,
        primary_branch_id: primaryBranch,
    });

    const toggleBranch = (branchId: number) => {
        const exists = form.data.branches.includes(branchId);

        if (exists) {
            const updatedBranches = form.data.branches.filter(
                (id) => id !== branchId,
            );

            form.setData('branches', updatedBranches);

            if (form.data.primary_branch_id === branchId) {
                form.setData(
                    'primary_branch_id',
                    updatedBranches.length === 1 ? updatedBranches[0] : '',
                );
            }
        } else {
            const updatedBranches = [...form.data.branches, branchId];
            form.setData('branches', updatedBranches);

            if (updatedBranches.length === 1) {
                form.setData('primary_branch_id', branchId);
            }
        }
    };

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isEdit && mechanic?.id) {
            form.put(`/mechanics/${mechanic.id}`, { preserveScroll: true });
            return;
        }
        form.post(`/mechanics`, { preserveScroll: true });
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Encabezado informativo */}
            <div>
                <h2 className="text-lg font-semibold">Información del mecánico</h2>
                <p className="text-sm text-muted-foreground">
                    Introduce los datos personales y de contacto del mecánico.
                </p>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Nombre del mecánico <span className="text-red-500">*</span>
                </label>
                <input
                    id="name"
                    type="text"
                    value={form.data.name}
                    onChange={(event) => form.setData('name', event.target.value)}
                    placeholder="Ej. Juan Pérez"
                    maxLength={255}
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
                {form.errors.name && (
                    <p className="text-sm text-red-600">{form.errors.name}</p>
                )}
            </div>

            {/* Dirección */}
            <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                    Dirección
                </label>
                <textarea
                    id="address"
                    value={form.data.address}
                    onChange={(event) => form.setData('address', event.target.value)}
                    placeholder="Calle, número, colonia, etc."
                    rows={3}
                    maxLength={255}
                    className="w-full resize-none rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
                {form.errors.address && (
                    <p className="text-sm text-red-600">{form.errors.address}</p>
                )}
            </div>

            {/* Teléfono y correo */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Teléfono */}
                <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                        Teléfono
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        value={form.data.phone}
                        onChange={(event) => form.setData('phone', event.target.value)}
                        placeholder="Ej. 9821234567"
                        maxLength={30}
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                    {form.errors.phone && (
                        <p className="text-sm text-red-600">{form.errors.phone}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        placeholder="mecanico@empresa.com"
                        maxLength={255}
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                    {form.errors.email && (
                        <p className="text-sm text-red-600">{form.errors.email}</p>
                    )}
                </div>
            </div>

            {/* Sucursales asignadas */}
            <div className="rounded-lg border p-4">
                <h2 className="mb-1 text-base font-semibold">
                    Sucursales asignadas
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    Selecciona las sucursales en las que estará activo este mecánico.
                </p>

                {branches.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No hay sucursales registradas o activas.
                    </p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {branches.map((branch) => {
                            const isChecked = form.data.branches.includes(branch.id);
                            return (
                                <label
                                    key={branch.id}
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                                        isChecked
                                            ? 'border-primary/50 bg-primary/5'
                                            : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleBranch(branch.id)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">
                                            {branch.name}
                                        </div>
                                        {branch.code && (
                                            <div className="text-xs text-muted-foreground">
                                                Código: {branch.code}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                )}

                {form.errors.branches && (
                    <p className="mt-2 text-sm text-red-600">{form.errors.branches}</p>
                )}
            </div>

            {/* Sucursal principal */}
            {form.data.branches.length > 0 && (
                <div className="rounded-lg border p-4">
                    <h2 className="mb-1 text-base font-semibold">
                        Sucursal principal
                    </h2>
                    <p className="mb-3 text-sm text-muted-foreground">
                        Sucursal base o principal asignada al mecánico.
                    </p>

                    <select
                        value={form.data.primary_branch_id}
                        onChange={(e) =>
                            form.setData(
                                'primary_branch_id',
                                e.target.value ? Number(e.target.value) : '',
                            )
                        }
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Selecciona la sucursal principal</option>
                        {branches
                            .filter((branch) =>
                                form.data.branches.includes(branch.id),
                            )
                            .map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name} {branch.code ? `(${branch.code})` : ''}
                                </option>
                            ))}
                    </select>

                    {form.errors.primary_branch_id && (
                        <p className="mt-2 text-sm text-red-600">
                            {form.errors.primary_branch_id}
                        </p>
                    )}
                </div>
            )}

            {/* Estado activo */}
            <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    <input
                        id="active"
                        type="checkbox"
                        checked={form.data.active}
                        onChange={(event) =>
                            form.setData('active', event.target.checked)
                        }
                        className="h-4 w-4 rounded border"
                    />
                    <div>
                        <label htmlFor="active" className="text-sm font-medium">
                            Mecánico activo
                        </label>
                        <p className="text-xs text-muted-foreground">
                            El mecánico podrá ser asignado a órdenes de servicio y ventas.
                        </p>
                    </div>
                </div>
                {form.errors.active && (
                    <p className="mt-2 text-sm text-red-600">{form.errors.active}</p>
                )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 border-t pt-6">
                <Link
                    href={`/mechanics`}
                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {form.processing
                        ? 'Guardando...'
                        : isEdit
                          ? 'Actualizar mecánico'
                          : 'Guardar mecánico'}
                </button>
            </div>
        </form>
    );
}


