import { Link, useForm } from '@inertiajs/react';

type Branch = {
    id?: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    active: boolean;
};

type BranchFormProps = {
    branch?: Branch;
/*     currentTeam?: {
        slug: string;
    }; */
    mode?: 'create' | 'edit';
};

type BranchFormData = {
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    active: boolean;
};

export default function BranchForm({
    branch,
    //currentTeam,
    mode = 'create',
}: BranchFormProps) {

    const isEdit = mode === 'edit';

    const form = useForm<BranchFormData>({
        name: branch?.name ?? '',
        code: branch?.code ?? '',
        address: branch?.address ?? '',
        phone: branch?.phone ?? '',
        email: branch?.email ?? '',
        active: branch?.active ?? true,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isEdit && branch?.id) {
            form.put(
                `/branches/${branch.id}`,
                {
                    preserveScroll: true,
                },
            );

            return;
        }

        form.post(
            `/branches`,
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <form
            onSubmit={submit}
            className="space-y-6"
        >
            {/* Información general */}
            <div>
                <h2 className="text-lg font-semibold">
                    Información de la sucursal
                </h2>

                <p className="text-sm text-muted-foreground">
                    Introduce los datos principales de la sucursal.
                </p>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="text-sm font-medium"
                >
                    Nombre de la sucursal *
                </label>

                <input
                    id="name"
                    type="text"
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData(
                            'name',
                            event.target.value,
                        )
                    }
                    placeholder="Ej. Sucursal Escárcega"
                    maxLength={255}
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />

                {form.errors.name && (
                    <p className="text-sm text-red-600">
                        {form.errors.name}
                    </p>
                )}
            </div>

            {/* Código */}
            <div className="space-y-2">
                <label
                    htmlFor="code"
                    className="text-sm font-medium"
                >
                    Código *
                </label>

                <input
                    id="code"
                    type="text"
                    value={form.data.code}
                    onChange={(event) =>
                        form.setData(
                            'code',
                            event.target.value.toUpperCase(),
                        )
                    }
                    placeholder="Ej. ESC"
                    maxLength={20}
                    className="w-full rounded-md border px-3 py-2 uppercase outline-none focus:ring-2 focus:ring-primary"
                />

                <p className="text-xs text-muted-foreground">
                    Código único para identificar la sucursal.
                </p>

                {form.errors.code && (
                    <p className="text-sm text-red-600">
                        {form.errors.code}
                    </p>
                )}
            </div>

            {/* Dirección */}
            <div className="space-y-2">
                <label
                    htmlFor="address"
                    className="text-sm font-medium"
                >
                    Dirección
                </label>

                <textarea
                    id="address"
                    value={form.data.address}
                    onChange={(event) =>
                        form.setData(
                            'address',
                            event.target.value,
                        )
                    }
                    placeholder="Dirección de la sucursal"
                    rows={3}
                    maxLength={255}
                    className="w-full resize-none rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />

                {form.errors.address && (
                    <p className="text-sm text-red-600">
                        {form.errors.address}
                    </p>
                )}
            </div>

            {/* Teléfono y correo */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Teléfono */}
                <div className="space-y-2">
                    <label
                        htmlFor="phone"
                        className="text-sm font-medium"
                    >
                        Teléfono
                    </label>

                    <input
                        id="phone"
                        type="tel"
                        value={form.data.phone}
                        onChange={(event) =>
                            form.setData(
                                'phone',
                                event.target.value,
                            )
                        }
                        placeholder="Ej. 9821234567"
                        maxLength={30}
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />

                    {form.errors.phone && (
                        <p className="text-sm text-red-600">
                            {form.errors.phone}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium"
                    >
                        Correo electrónico
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={form.data.email}
                        onChange={(event) =>
                            form.setData(
                                'email',
                                event.target.value,
                            )
                        }
                        placeholder="sucursal@empresa.com"
                        maxLength={255}
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />

                    {form.errors.email && (
                        <p className="text-sm text-red-600">
                            {form.errors.email}
                        </p>
                    )}
                </div>

            </div>

            {/* Estado */}
            <div className="rounded-lg border p-4">

                <div className="flex items-center gap-3">

                    <input
                        id="active"
                        type="checkbox"
                        checked={form.data.active}
                        onChange={(event) =>
                            form.setData(
                                'active',
                                event.target.checked,
                            )
                        }
                        className="h-4 w-4 rounded border"
                    />

                    <div>
                        <label
                            htmlFor="active"
                            className="text-sm font-medium"
                        >
                            Sucursal activa
                        </label>

                        <p className="text-xs text-muted-foreground">
                            La sucursal podrá utilizarse
                            inmediatamente en el sistema.
                        </p>
                    </div>

                </div>

                {form.errors.active && (
                    <p className="mt-2 text-sm text-red-600">
                        {form.errors.active}
                    </p>
                )}

            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 border-t pt-6">

                <Link
                    href={`/branches`}
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
                            ? 'Actualizar sucursal'
                            : 'Guardar sucursal'}
                </button>

            </div>
        </form>
    );
}