import { Head, Link } from '@inertiajs/react';
import ProductForm from '@/components/products/product-form';

type Props = {
    categories: {
        id: number;
        name: string;
    }[];

    brands: {
        id: number;
        name: string;
    }[];

    priceTypes: {
        id: number;
        name: string;
        slug: string;
    }[];

/*     currentTeam?: {
        slug: string;
    }; */
};

export default function Create({
    categories,
    brands,
    priceTypes,
    //currentTeam,
}: Props) {

    return (
        <>
            <Head title="Nuevo producto" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border ">
                    
                        <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Nuevo producto
                                </h1>
                                <p className="mt-1 text-sm text-white">
                                    Registra una nueva refacción.
                                </p>
                            </div>
                            <Link href="/products" className="rounded-md border px-4 py-2 text-sm">
                                Volver
                            </Link>
                        </div>
                        <div className="p-6">
                            <ProductForm
                                categories={categories}
                                brands={brands}
                                priceTypes={priceTypes}
                                mode="create"
                            />
                        </div>
                    
                </div>
            </div>
        </>
    );
}
Create.layout = () => ({
    breadcrumbs: [
        {
            title: 'Productos',
            href: '/products',
        },
        {
            title: 'Nuevo producto',
            href: '#',
        },
    ],
});

