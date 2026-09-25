import { Link, useForm } from '@inertiajs/react';

type Supplier = {
    id:number;
    business_name:string;
    contact_name:string;
    phone:string;
    email:string;
    address:string;
    rfc:string;
    active:boolean;
}

type SupplierFormProps = {
    supplier?: Supplier;
    mode?: 'create' | 'edit';
};

type SupplierFormData = {
    business_name:string;
    contact_name:string;
    phone:string;
    email:string;
    address:string;
    rfc:string;
    active:boolean;
};

export default function SupplierForm({
    supplier,
    mode = 'create',
}: SupplierFormProps) {

    const isEdit = mode === 'edit';

    const form = useForm<SupplierFormData>({
        business_name: supplier?.business_name ?? '',
        contact_name: supplier?.contact_name ?? '',
        phone: supplier?.phone ?? '',
        email: supplier?.email ?? '',
        address: supplier?.address ?? '',
        rfc: supplier?.rfc ?? '',
        active: supplier?.active ?? true,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isEdit && supplier?.id) {
            form.put(
                `/suppliers/${supplier.id}`,
                {
                    preserveScroll: true,
                },
            );

            return;
        }

        form.post(
            `/suppliers`,
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Información general */}
            <div>
                <h2 className="text-lg font-semibold">
                    Información del proveedor
                </h2>
                <p className="text-sm text-muted-foreground">
                    Introduce los datos principales de la sucursal.
                </p>
            </div>
            {/* Nombre */}
            <div className="space-y-2">
                <label htmlFor="business_name" className="text-sm font-medium">
                    Nombre del proveedor *
                </label>
                <input
                    id="business_name"
                    type="text"
                    value={form.data.business_name}
                    onChange={(event) =>
                        form.setData(
                            'business_name',
                            event.target.value,
                        )
                    }
                    placeholder="Ej. Italika"
                    maxLength={255}
                    autoComplete='off'
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
                {form.errors.business_name && (
                    <p className="text-sm text-red-600">
                        {form.errors.business_name}
                    </p>
                )}
            </div>
            {/* RFC */}
            <div className="space-y-2">
                <label htmlFor="rfc" className="text-sm font-medium">
                    RFC
                </label>
                <input
                    id="rfc"
                    type="text"
                    value={form.data.rfc}
                    onChange={(event) =>
                        form.setData(
                            'rfc',
                            event.target.value.toUpperCase(),
                        )
                    }
                    placeholder="Ej. JUPRR2912G2"
                    maxLength={20}
                    className="w-full rounded-md border px-3 py-2 uppercase outline-none focus:ring-2 focus:ring-primary"
                />
                {form.errors.rfc && (
                    <p className="text-sm text-red-600">
                        {form.errors.rfc}
                    </p>
                )}
            </div>             
            {/* Contácto */}
            <div className="space-y-2">
                <label htmlFor="contact_name" className="text-sm font-medium">
                    Nombre del contácto
                </label>
                <input
                    id="contact_name"
                    type="text"
                    value={form.data.contact_name}
                    onChange={(event) =>
                        form.setData(
                            'contact_name',
                            event.target.value,
                        )
                    }
                    placeholder="Ej. Juan Perez"
                    maxLength={100}
                    autoComplete='off'
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />

                <p className="text-xs text-muted-foreground">
                    Nombre del contácto del proveedor.
                </p>

                {form.errors.contact_name && (
                    <p className="text-sm text-red-600">
                        {form.errors.contact_name}
                    </p>
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
                        onChange={(event) =>
                            form.setData(
                                'phone',
                                event.target.value,
                            )
                        }
                        placeholder="Ej. 9821234567"
                        maxLength={30}
                        autoComplete='off'
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
                    <label htmlFor="email" className="text-sm font-medium">
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
                        placeholder="proveedor@empresa.com"
                        maxLength={255}
                        autoComplete='off'
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />

                    {form.errors.email && (
                        <p className="text-sm text-red-600">
                            {form.errors.email}
                        </p>
                    )}
                </div>

            </div>

  
            {/* Dirección */}
            <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
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
                    placeholder="Dirección del proveedor"
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

            {/* Botones */}
            <div className="flex justify-end gap-3 border-t pt-6">

                <Link href={`/suppliers`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                    Cancelar
                </Link>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="hover:cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {form.processing
                        ? 'Guardando...'
                        : isEdit
                            ? 'Actualizar proveedor'
                            : 'Guardar proveedor'}
                </button>

            </div>
        </form>
    );
}