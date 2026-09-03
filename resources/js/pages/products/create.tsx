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

                <div className="rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Nuevo producto
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Registra una nueva refacción.
                            </p>
                        </div>
                        <Link href="/products" className="rounded-md border px-4 py-2 text-sm">
                            Volver
                        </Link>
                    </div>

                    <ProductForm
                        categories={categories}
                        brands={brands}
                        priceTypes={priceTypes}
                        //currentTeam={currentTeam?.slug ?? ''}
                        mode="create"
                    />

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

