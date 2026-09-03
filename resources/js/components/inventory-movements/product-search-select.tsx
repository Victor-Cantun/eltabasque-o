import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, Package, Barcode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type ProductOption = {
    id: number;
    name: string;
    sku: string;
    barcode?: string | null;
};

type Props = {
    products: ProductOption[];
    value: string | number;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
};

export default function ProductSearchSelect({
    products,
    value,
    onChange,
    error,
    disabled = false,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selectedProduct = useMemo(() => {
        if (!value) return null;
        return products.find((p) => String(p.id) === String(value)) || null;
    }, [products, value]);

    // Filtrar productos por nombre, SKU o código de barras/serie
    const filteredProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return products;
        }

        return products.filter((p) => {
            const matchesName = p.name.toLowerCase().includes(query);
            const matchesSku = p.sku.toLowerCase().includes(query);
            const matchesBarcode = p.barcode ? p.barcode.toLowerCase().includes(query) : false;

            return matchesName || matchesSku || matchesBarcode;
        });
    }, [products, searchTerm]);

    // Cerrar el dropdown al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Asegurar que el índice resaltado esté dentro del rango
    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchTerm]);

    // Scroll automático al elemento resaltado
    useEffect(() => {
        if (isOpen && listRef.current) {
            const activeElement = listRef.current.children[highlightedIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    const handleSelect = (product: ProductOption) => {
        onChange(String(product.id));
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        onChange('');
        setSearchTerm('');
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev < filteredProducts.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev > 0 ? prev - 1 : filteredProducts.length - 1
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredProducts[highlightedIndex]) {
                handleSelect(filteredProducts[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Si ya hay un producto seleccionado y no estamos buscando */}
            {selectedProduct && !isOpen ? (
                <div
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen(true);
                            setTimeout(() => inputRef.current?.focus(), 50);
                        }
                    }}
                    className={`flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors cursor-pointer hover:border-primary/60 ${
                        error ? 'border-destructive' : 'border-input'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                        <Package className="size-4 shrink-0 text-primary" />
                        <span className="truncate font-semibold text-foreground">
                            {selectedProduct.name}
                        </span>
                        <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                            SKU: {selectedProduct.sku}
                        </Badge>
                        {selectedProduct.barcode && (
                            <Badge variant="secondary" className="text-[11px] font-mono shrink-0 gap-1 hidden sm:inline-flex">
                                <Barcode className="size-3" />
                                {selectedProduct.barcode}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Limpiar selección"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            ) : (
                /* Campo de búsqueda interactivo */
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            disabled={disabled}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (!isOpen) setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                selectedProduct
                                    ? `Seleccionado: ${selectedProduct.name} (Escribe para cambiar)`
                                    : 'Escribe el nombre, SKU o serie del producto...'
                            }
                            className={`w-full rounded-md border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                                error ? 'border-destructive' : 'border-input'
                            } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    {/* Menú Desplegable con Resultados */}
                    {isOpen && (
                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
                            <ul ref={listRef} className="p-1 text-sm divide-y divide-border/50">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product, index) => {
                                        const isSelected = String(product.id) === String(value);
                                        const isHighlighted = index === highlightedIndex;

                                        return (
                                            <li
                                                key={product.id}
                                                onClick={() => handleSelect(product)}
                                                onMouseEnter={() => setHighlightedIndex(index)}
                                                className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer rounded-sm transition-colors ${
                                                    isHighlighted ? 'bg-accent text-accent-foreground' : ''
                                                } ${isSelected ? 'font-semibold' : ''}`}
                                            >
                                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate">{product.name}</span>
                                                        {isSelected && (
                                                            <Check className="size-4 text-primary shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">
                                                            SKU: {product.sku}
                                                        </span>
                                                        {product.barcode && (
                                                            <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1">
                                                                <Barcode className="size-3" />
                                                                Serie/Cód: {product.barcode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                                        No se encontraron productos con "{searchTerm}".
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
        </div>
    );
}
