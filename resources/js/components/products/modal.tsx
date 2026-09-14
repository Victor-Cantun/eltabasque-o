import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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

type Props = {
    selectedProduct?:Product|null;
    isAdmin:boolean;
    branchId:string;
    onClose:() => void;
}

export default function Modal({selectedProduct,isAdmin,branchId, onClose }:Props) {

    if(!selectedProduct) return null;

    console.log(selectedProduct);
    //const [selectedProduct, setSelectedProduct] = useState< Product | null >(null);

    return (
        selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background shadow-2xl" onClick={(e) => e.stopPropagation()} >
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
                            onClick={onClose}
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
                                    {/* <p className="mt-1 text-sm text-muted-foreground">Código interno: {selectedProduct.internal_code}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Código original: {selectedProduct.original_code}</p> */}
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
                            <div className="mb-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Códigos</p>
                                <div className="mb-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">Código interno</p>
                                        <p className="mt-0.5 font-mono text-sm font-medium">{selectedProduct.internal_code ?? '—'}</p>
                                    </div>
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">Código original</p>
                                        <p className="mt-0.5 font-mono text-sm font-medium">{selectedProduct.original_code ?? '—'}</p>
                                    </div>                                
                                </div>
                            </div>
                                <div className="mb-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inventario</p>
                                <div className="mb-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">Costo</p>
                                        <p className="mt-0.5 text-base font-bold">${Number(selectedProduct.cost).toFixed(2)}</p>
                                    </div>
                                    <div className="rounded-lg border bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            {isAdmin && !branchId ? 'Stock total (ambas sucursales)' : 'Stock actual'}
                                        </p>
                                        <p className="mt-0.5 text-sm font-semibold">{selectedProduct.stock ?? 0}</p>
                                    </div>
                                </div>                            
                            </div>

                            <div className="mb-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Precios</p>
                                <div className="grid grid-cols-3 gap-2">
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

                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/products/${selectedProduct.id}/edit`} className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity" >
                                    Editar producto
                                </Link>
                                <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors" >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                
            </div>                
        )   
    );
}                
