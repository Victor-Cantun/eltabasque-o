import { Head, Link } from '@inertiajs/react';
import ProductForm from '@/components/products/product-form';

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

type ProductPrice = {
    id: number;
    price_type_id: number;
    price: string | number;
};

type Product = {
    id: number;
    sku: string;
    barcode?: string | null;
    name: string;
    description?: string | null;
    cost: string | number;
    //minimum_stock: string | number;
    category_id?: number | null;
    brand_id?: number | null;
    active: boolean;

    prices?: ProductPrice[];
};

type Props = {
    product: Product;
    categories: Category[];
    brands: Brand[];
    priceTypes: PriceType[];
/*     currentTeam?: {
        slug: string;
    }; */
};

export default function Edit({
    product,
    categories,
    brands,
    priceTypes,
    //currentTeam,
}: Props) {
    console.log('PRODUCTO RECIBIDO:', product);
    return (
        <>
            <Head title={`Editar ${product.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border bg-card">
                    <div className="mb-6 flex items-center justify-between rounded-t-lg py-2 px-6 text-lg font-bold bg-blue-700 text-white">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Editar producto
                            </h1>
                            <p className="mt-1 text-sm text-white">
                                {product.name}
                            </p>
                        </div>
                        <Link href="/products" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                            Volver
                        </Link>
                    </div>
                    <div className="p-6">
                        <ProductForm
                            product={product}
                            categories={categories}
                            brands={brands}
                            priceTypes={priceTypes}
                            mode="edit"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
Edit.layout = () => ({
    breadcrumbs: [
        {
            title: 'Productos',
            href: '/products',
        },
        {
            title: 'Editar producto',
            href: '#',
        },
    ],
});