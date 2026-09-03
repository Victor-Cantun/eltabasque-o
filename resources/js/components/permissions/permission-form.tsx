import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Permission = {
    id: number;
    name: string;
    slug: string;
    module: string | null;
};

type Props = {
    permission?: Permission;
    mode: 'create' | 'edit';
};

export default function PermissionForm({
    permission,
    mode,
}: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: permission?.name ?? '',
        slug: permission?.slug ?? '',
        module: permission?.module ?? '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (mode === 'create') {
            post('/permissions');
            return;
        }

        if (permission) {
            put(`/permissions/${permission.id}`);
        }
    };

    return (
        <form
            onSubmit={submit}
            className="space-y-6"
        >
            {/* Nombre */}
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                >
                    Nombre
                </label>

                <input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(event) =>
                        setData('name', event.target.value)
                    }
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="Ej. Crear productos"
                />

                {errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.name}
                    </p>
                )}
            </div>

            {/* Slug */}
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
                    onChange={(event) =>
                        setData('slug', event.target.value)
                    }
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="products.create"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                    Identificador único utilizado internamente por el sistema.
                </p>

                {errors.slug && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.slug}
                    </p>
                )}
            </div>

            {/* Módulo */}
            <div>
                <label
                    htmlFor="module"
                    className="mb-2 block text-sm font-medium"
                >
                    Módulo
                </label>

                <input
                    id="module"
                    type="text"
                    value={data.module}
                    onChange={(event) =>
                        setData('module', event.target.value)
                    }
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="Productos"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                    Ejemplo: Productos, Ventas, Inventario o Usuarios.
                </p>

                {errors.module && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.module}
                    </p>
                )}
            </div>

            {/* Botón */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    {processing
                        ? 'Guardando...'
                        : mode === 'create'
                            ? 'Crear permiso'
                            : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
}