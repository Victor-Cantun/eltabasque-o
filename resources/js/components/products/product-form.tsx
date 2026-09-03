import { useForm } from '@inertiajs/react';

type Category = {
    id: number;
    name: string;
};

type Brand = {
    id: number;
    name: string;
};

type PriceType = {
    id: number;
    name: string;
    slug: string;
};

type Product = {
    id?: number;
    name: string;
    internal_code?: string | null;
    original_code?:string|null;
    description?: string | null;
    cost: number | string;
    //minimum_stock:number|string;
    category_id?: number | string | null;
    brand_id?: number | string | null;
    active?:boolean;

    prices?: {
        id?: number;
        price_type_id: number;
        price: number | string;
    }[];
};

type Props = {
    product?: Partial<Product>;
    categories: Category[];
    brands: Brand[];
    priceTypes: PriceType[];
    //currentTeam:string;
    mode: 'create' | 'edit';
};

export default function ProductForm({
    product,
    categories,
    brands,
    priceTypes,
    mode,
    //currentTeam,
}: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name ?? '',
        internal_code: product?.internal_code ?? '',
        original_code:product?.original_code ?? '',
        description: product?.description ?? '',
        cost: product?.cost ?? '',
        category_id: product?.category_id ?? '',
        brand_id: product?.brand_id ?? '',
        //minimum_stock: product?.minimum_stock ?? '',
        active: product?.active ?? true,
        image: null as File | null,

        prices: priceTypes.map((priceType) => {
            const existingPrice = product?.prices?.find(
                (price) => price.price_type_id === priceType.id,
            );

            return {
                price_type_id: priceType.id,
                price: existingPrice?.price ?? '',
            };
        }),
        _method: mode === 'edit' ? 'PUT' : '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (mode === 'create') {
            post('/products', {
                forceFormData: true,
            });
            return;
        }

        if (product && product.id) {
            post(`/products/${product.id}`, {
                forceFormData: true,
            });
        }
    }

    return (
        <form
            onSubmit={submit}
            className="space-y-6"
        >
            <div className="grid gap-6 md:grid-cols-2">

                {/* Nombre */}

                <div>
                    <label className="text-sm font-medium">
                        Nombre
                    </label>

                    <input
                        type="text"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        className="mt-2 w-full rounded-md border p-2"
                    />

                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* SKU */}

                <div>
                    <label className="text-sm font-medium">
                        Código interno
                    </label>

                    <input
                        type="text"
                        value={data.internal_code}
                        onChange={(event) =>
                            setData('internal_code', event.target.value)
                        }
                        className="mt-2 w-full rounded-md border p-2"
                    />

                    {errors.internal_code && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.internal_code}
                        </p>
                    )}
                </div>
                {/* Código de barras */}
                <div>
                    <label className="text-sm font-medium">
                        Código original
                    </label>

                    <input
                        type="text"
                        value={data.original_code}
                        onChange={(event) =>
                            setData('original_code', event.target.value)
                        }
                        className="mt-2 w-full rounded-md border p-2"
                    />

                    {errors.original_code && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.original_code}
                        </p>
                    )}
                </div>
                {/* Stock mínimo */}
{/*                 <div>
                    <label className="text-sm font-medium">
                        Stock mínimo
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={data.minimum_stock}
                        onChange={(event) =>
                            setData(
                                'minimum_stock',
                                event.target.value
                            )
                        }
                        className="mt-2 w-full rounded-md border p-2"
                    />

                    {errors.minimum_stock && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.minimum_stock}
                        </p>
                    )}
                </div>   */}              
                {/* Categoría */}

                <div>
                    <label className="text-sm font-medium">
                        Categoría
                    </label>

                    <select
                        value={data.category_id}
                        onChange={(event) =>
                            setData(
                                'category_id',
                                event.target.value,
                            )
                        }
                        className="mt-2 w-full rounded-md border p-2"
                    >
                        <option value="">
                            Selecciona una categoría
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    {errors.category_id && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.category_id}
                        </p>
                    )}
                </div>

                {/* Marca */}

                <div>
                    <label className="text-sm font-medium">
                        Marca
                    </label>

                    <select
                        value={data.brand_id}
                        onChange={(event) =>
                            setData(
                                'brand_id',
                                event.target.value,
                            )
                        }
                        className="mt-2 w-full rounded-md border p-2"
                    >
                        <option value="">
                            Selecciona una marca
                        </option>

                        {brands.map((brand) => (
                            <option
                                key={brand.id}
                                value={brand.id}
                            >
                                {brand.name}
                            </option>
                        ))}
                    </select>

                    {errors.brand_id && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.brand_id}
                        </p>
                    )}
                </div>

                {/* Costo */}

                <div>
                    <label className="text-sm font-medium">
                        Costo
                    </label>

                    <input
                        type="number"
                        step="0.01"
                        value={data.cost}
                        onChange={(event) =>
                            setData(
                                'cost',
                                event.target.value,
                            )
                        }
                        className="mt-2 w-full rounded-md border p-2"
                    />

                    {errors.cost && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.cost}
                        </p>
                    )}
                </div>

            </div>

            {/* Descripción */}

            <div>
                <label className="text-sm font-medium">
                    Descripción
                </label>

                <textarea
                    value={data.description}
                    onChange={(event) =>
                        setData(
                            'description',
                            event.target.value,
                        )
                    }
                    className="mt-2 w-full rounded-md border p-2"
                    rows={4}
                />

                {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.description}
                    </p>
                )}
            </div>

            {/* Precios */}

            <div className="border-t pt-6">

                <h2 className="text-lg font-semibold">
                    Precios
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-3">

                    {priceTypes.map((priceType, index) => (

                        <div key={priceType.id}>

                            <label className="text-sm font-medium">
                                {priceType.name}
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                value={data.prices[index]?.price ?? ''}
                                onChange={(event) => {

                                    const prices = [
                                        ...data.prices,
                                    ];

                                    prices[index] = {
                                        ...prices[index],
                                        price: event.target.value,
                                    };

                                    setData(
                                        'prices',
                                        prices,
                                    );
                                }}
                                className="mt-2 w-full rounded-md border p-2"
                                placeholder="0.00"
                            />

                            {errors[
                                `prices.${index}.price`
                            ] && (
                                <p className="mt-1 text-sm text-red-500">
                                    {
                                        errors[
                                            `prices.${index}.price`
                                        ]
                                    }
                                </p>
                            )}

                        </div>

                    ))}

                </div>

            </div>

            {/* Imagen */}

            <div className="border-t pt-6">

                <h2 className="text-lg font-semibold">
                    Imagen
                </h2>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {

                        const file =
                            event.target.files?.[0] ?? null;

                        setData('image', file);
                    }}
                    className="mt-4"
                />

                {errors.image && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.image}
                    </p>
                )}

            </div>

            <button
                type="submit"
                disabled={processing}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            >
                {processing
                    ? 'Guardando...'
                    : mode === 'create'
                      ? 'Guardar producto'
                      : 'Actualizar producto'}
            </button>

        </form>
    );
}