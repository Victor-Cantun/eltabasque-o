import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
type Branches = {
    id: number;
    name: string;
};

type Precios = {
    id: number;
    product_id: number;
    price_type_id: number;
    price: number | string;
    priceType?: {
        id: number;
        name: string;
    };
};

type Product = {
    id: number;
    internal_code: string;
    original_code?: string | null;
    name: string;
    description?: string | null;
    image?: string | null;
    prices: Precios[];
    cost: string | number;
    active: boolean;
    stock: number | null; // viene de withSum, puede ser null si no hay inventario
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedProducts = {
    data: Product[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

type Props = {
    products: PaginatedProducts;
    branches: Branches[];
    isAdmin: boolean;
    filters: {
        search?: string;
        active?: string;
        branch_id?: string;
    };
};

export default function Index({
    products,
    branches,
    isAdmin,
    filters,
}: Props) {
    const filterByBranch = (branchId: string) => {
        router.get('/products', { ...filters, branch_id: branchId || undefined }, {
            preserveState: true,
        });
    };

    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [active, setActive] = useState(
        filters.active ?? '',
    );

    const [branchId, setBranchId] = useState(
        filters.branch_id ?? '',
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters();
        }, 400);

        return () => clearTimeout(timeout);
    }, [search]);

    function applyFilters() {
        router.get(
            `/products`,
            {
                search,
                branch_id: branchId,
                active,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function clearFilters() {
        setSearch('');
        setActive('');
        setBranchId('');

        router.get(
            `/products`,
        );
    }

    function getPrice(
        prices: Precios[],
        priceTypeId: number
    ): string {
        const price = prices.find(
            (item) => item.price_type_id === priceTypeId
        );

        return price
            ? Number(price.price).toFixed(2)
            : '0.00';
    }

    function isNewProduct(createdAt: string): boolean {
        const created = new Date(createdAt).getTime();
        const now = Date.now();
        const diffInDays = (now - created) / (1000 * 60 * 60 * 24);
        return diffInDays <= 30;
    }

    // Nombre de la sucursal actualmente seleccionada (para el vendedor, que no ve el <select>)
    const currentBranchName = branches.find(
        (b) => String(b.id) === branchId,
    )?.name;

    return (
        <>
            <Head title="Productos" />

            {/* Modal de detalle de producto */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {selectedProduct.image ? (
                            <div className="relative h-56 w-full overflow-hidden rounded-t-2xl bg-muted">
                                <img
                                    src={`/storage/${selectedProduct.image}`}
                                    alt={selectedProduct.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="flex h-40 w-full items-center justify-center rounded-t-2xl bg-muted">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-6">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold leading-tight">{selectedProduct.name}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Código interno: {selectedProduct.internal_code}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Código original: {selectedProduct.original_code}</p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    selectedProduct.active
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                    {selectedProduct.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            {selectedProduct.description && (
                                <p className="mb-4 text-sm text-muted-foreground">{selectedProduct.description}</p>
                            )}

                            <div className="mb-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg border bg-muted/40 p-3">
                                    <p className="text-xs text-muted-foreground">Código original</p>
                                    <p className="mt-0.5 font-mono text-sm font-medium">{selectedProduct.original_code ?? '—'}</p>
                                </div>
                                <div className="rounded-lg border bg-muted/40 p-3">
                                    <p className="text-xs text-muted-foreground">
                                        {isAdmin && !branchId ? 'Stock total (ambas sucursales)' : 'Stock actual'}
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold">{selectedProduct.stock ?? 0}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Precios</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">Precio público</p>
                                        <p className="mt-0.5 text-base font-bold text-primary">${getPrice(selectedProduct.prices, 1)}</p>
                                    </div>
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">Precio mecánico</p>
                                        <p className="mt-0.5 text-base font-bold">${getPrice(selectedProduct.prices, 2)}</p>
                                    </div>
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">Precio mayoreo</p>
                                        <p className="mt-0.5 text-base font-bold">${getPrice(selectedProduct.prices, 3)}</p>
                                    </div>
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">Costo</p>
                                        <p className="mt-0.5 text-base font-bold">${Number(selectedProduct.cost).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/products/${selectedProduct.id}/edit`}
                                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                                >
                                    Editar producto
                                </Link>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Productos</h1>
                        <p className="text-sm text-muted-foreground">
                            Catálogo de refacciones
                            {!isAdmin && currentBranchName && (
                                <> · Sucursal: <span className="font-medium">{currentBranchName}</span></>
                            )}
                        </p>
                    </div>

                    <Link
                        href={`/products/create`}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        + Nuevo producto
                    </Link>
                </div>

                {/* Filtros */}
                <div className="rounded-xl border p-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="text-sm font-medium">Sucursal</label>
                            {/* Solo el administrador puede cambiar de sucursal / ver "todas" */}
                            {isAdmin ? (
                                <select
                                    defaultValue={filters.branch_id ?? ''}
                                    onChange={(e) => filterByBranch(e.target.value)}
                                    className="mt-1 w-full rounded-md border px-3 py-2"
                                >
                                    <option value="">Todas las sucursales</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex items-center rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                                    Sucursal: {currentBranchName ?? branches[0]?.name ?? '—'}
                                </div>
                            )}
                        </div>

                        {/* Buscar */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Buscar</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="SKU, código de barras o nombre..."
                                className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-blue-800 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        {isAdmin && !branchId ? 'Stock total' : 'Stock'}
                                    </th>
                                    <th className="px-4 py-3 text-left">Código interno</th>
                                    <th className="px-4 py-3 text-left">Código original</th>
                                    <th className="px-4 py-3 text-left">Producto</th>
                                    <th className="px-4 py-3 text-left">Precio mayoreo</th>
                                    <th className="px-4 py-3 text-left">Precio mecanico</th>
                                    <th className="px-4 py-3 text-left">Precio público</th>
                                    <th className="px-4 py-3 text-left">Precio costos</th>
                                    <th className="px-4 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="overflow-x-hidden">
                                {products.data.map((product, index) => (
                                    <tr key={index} className={`border-b last:border-0 ${isNewProduct(product.created_at) ? 'bg-green-50 text-black dark:bg-green-50 dark:text-black' : ''}`}>
                                        <td className="px-4 py-3 font-medium">{product.stock ?? 0}</td>
                                        <td className="px-4 py-3 font-medium">{product.internal_code}</td>
                                        <td className="px-4 py-3 font-medium">{product.original_code}</td>
                                        <td className="px-4 py-3 min-w-72">
                                            {product.name}
                                            {isNewProduct(product.created_at) && (
                                                <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white dark:bg-green-500 dark:text-white">
                                                    Nuevo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">${getPrice(product.prices, 3)}</td>
                                        <td className="px-4 py-3">${getPrice(product.prices, 2)}</td>
                                        <td className="px-4 py-3">${getPrice(product.prices, 1)}</td>
                                        <td className="px-4 py-3">${Number(product.cost).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <a onClick={() => setSelectedProduct(product)} className="hover:cursor-pointer"><Eye className="h-4 w-4 text-blue-800" /></a>
                                                <Link href={`/products/${product.id}/edit`} className="hover:cursor-pointer">
                                                    <Pencil className="h-4 w-4 text-blue-800" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {products.data.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                            No se encontraron productos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginación */}
                <div className="flex flex-wrap gap-1">
                    {products.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`rounded border px-3 py-1 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}