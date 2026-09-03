import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Building2, Tag, AlertCircle, CheckCircle2, User as UserIcon, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Branch = {
    id: number;
    name: string;
    code: string;
};

type PriceType = {
    id: number;
    name: string;
    slug: string;
    description?: string;
};

type ProductPrice = {
    id: number;
    product_id: number;
    price_type_id: number;
    price: string | number;
    price_type?: PriceType;
};

type Inventory = {
    id: number;
    branch_id: number;
    product_id: number;
    stock: string | number;
    minimum_stock: string | number;
};

type Category = {
    id: number;
    name: string;
};

type Brand = {
    id: number;
    name: string;
};

type Product = {
    id: number;
    sku: string;
    barcode?: string | null;
    name: string;
    cost: string | number;
    category?: Category | null;
    brand?: Brand | null;
    prices?: ProductPrice[];
    inventories?: Inventory[];
};

type Customer = {
    id: number;
    name: string;
    phone?: string;
    email?: string;
};

type Mechanic = {
    id: number;
    name: string;
};

type CartItem = {
    id: string; // único en carrito (ej: 'prod-1' o 'service-123')
    product_id: number | null;
    product?: Product | null;
    description?: string;
    price_type_id: number | null;
    quantity: number;
    unit_price: number;
    discount: number;
    is_service?: boolean;
    item_type: 'product' | 'service';
    mechanic_id?: number | null;
};

type Props = {
    branches: Branch[];
    selectedBranchId: number;
    priceTypes: PriceType[];
    products: Product[];
    customers: Customer[];
    mechanics: Mechanic[];
};

export default function Create({
    branches,
    selectedBranchId,
    priceTypes,
    products,
    customers,
    mechanics: initialMechanics = [],
}: Props) {
    const [currentBranchId, setCurrentBranchId] = useState<number>(selectedBranchId);
    const [mechanicsList, setMechanicsList] = useState<Mechanic[]>(initialMechanics);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [globalDiscount, setGlobalDiscount] = useState<number>(0);
    const [taxRate, setTaxRate] = useState<number>(0);

    // Modal para agregar Servicio / Mano de Obra
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [serviceName, setServiceName] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [serviceQty, setServiceQty] = useState('1');
    const [selectedMechanicId, setSelectedMechanicId] = useState<string>('');
    const [isCreatingMechanic, setIsCreatingMechanic] = useState(false);
    const [newMechanicName, setNewMechanicName] = useState('');

    // Helper para obtener el stock de un producto en la sucursal seleccionada
    const getStockForBranch = (product: Product, branchId: number): number => {
        const inv = product.inventories?.find((i) => Number(i.branch_id) === Number(branchId));
        return inv ? Number(inv.stock) : 0;
    };

    // Helper para obtener el precio según el tipo de precio seleccionado
    const getPriceForType = (product: Product, priceTypeId: number): number => {
        const priceObj = product.prices?.find((p) => Number(p.price_type_id) === Number(priceTypeId));
        return priceObj ? Number(priceObj.price) : Number(product.cost) * 1.2;
    };

    // Obtenemos categorías únicas de la lista de productos
    const categories = useMemo(() => {
        const map = new Map<number, Category>();
        products.forEach((p) => {
            if (p.category) map.set(p.category.id, p.category);
        });
        return Array.from(map.values());
    }, [products]);

    // Filtrar productos según búsqueda y categoría
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query) ||
                (p.barcode && p.barcode.toLowerCase().includes(query));

            const matchesCategory = selectedCategoryId
                ? String(p.category?.id) === selectedCategoryId
                : true;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategoryId]);

    // Crear mecánico rápido si no existe
    const handleCreateQuickMechanic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMechanicName.trim()) return;

        try {
            const response = await fetch('/mechanics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ name: newMechanicName.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.mechanic) {
                    setMechanicsList((prev) => [...prev, data.mechanic]);
                    setSelectedMechanicId(String(data.mechanic.id));
                    setNewMechanicName('');
                    setIsCreatingMechanic(false);
                }
            } else {
                alert('No se pudo registrar el mecánico. Verifica los datos.');
            }
        } catch {
            alert('Error de conexión al registrar el mecánico.');
        }
    };

    // Agregar producto al carrito
    const addToCart = (product: Product) => {
        const availableStock = getStockForBranch(product, currentBranchId);
        if (availableStock <= 0) {
            alert(`El producto "${product.name}" no tiene stock disponible en la sucursal seleccionada.`);
            return;
        }

        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex((item) => item.product_id === product.id && item.item_type === 'product');
            const defaultPriceType = priceTypes[0]?.id ?? 1;

            if (existingIndex >= 0) {
                const currentItem = prevCart[existingIndex];
                if (currentItem.quantity + 1 > availableStock) {
                    alert(`No puedes agregar más unidades de "${product.name}". Stock máximo disponible: ${availableStock}`);
                    return prevCart;
                }
                const updated = [...prevCart];
                updated[existingIndex] = {
                    ...currentItem,
                    quantity: currentItem.quantity + 1,
                };
                return updated;
            } else {
                const initialPrice = getPriceForType(product, defaultPriceType);
                return [
                    ...prevCart,
                    {
                        id: `prod-${product.id}`,
                        product_id: product.id,
                        product,
                        description: product.name,
                        price_type_id: defaultPriceType,
                        quantity: 1,
                        unit_price: initialPrice,
                        discount: 0,
                        is_service: false,
                        item_type: 'product',
                        mechanic_id: null,
                    },
                ];
            }
        });
    };

    // Agregar servicio / mano de obra personalizado al carrito
    const handleAddServiceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceName.trim()) {
            alert('Por favor ingresa la descripción del servicio.');
            return;
        }
        const priceNum = Math.max(0, parseFloat(servicePrice) || 0);
        const qtyNum = Math.max(1, parseFloat(serviceQty) || 1);

        const newServiceItem: CartItem = {
            id: `service-${Date.now()}`,
            product_id: null,
            product: null,
            description: serviceName.trim(),
            price_type_id: null,
            quantity: qtyNum,
            unit_price: priceNum,
            discount: 0,
            is_service: true,
            item_type: 'service',
            mechanic_id: selectedMechanicId ? Number(selectedMechanicId) : null,
        };

        setCart((prev) => [...prev, newServiceItem]);
        setServiceName('');
        setServicePrice('');
        setServiceQty('1');
        setSelectedMechanicId('');
        setShowServiceModal(false);
    };

    // Modificar mecánico asignado a un servicio en el carrito
    const handleItemMechanicChange = (cartItemId: string, mechanicId: number | null) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === cartItemId ? { ...item, mechanic_id: mechanicId } : item
            )
        );
    };

    // Modificar tipo de precio de un ítem producto en el carrito
    const handlePriceTypeChange = (cartItemId: string, priceTypeId: number) => {
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.id === cartItemId && item.product) {
                    const newUnitPrice = getPriceForType(item.product, priceTypeId);
                    return {
                        ...item,
                        price_type_id: priceTypeId,
                        unit_price: newUnitPrice,
                    };
                }
                return item;
            })
        );
    };

    // Modificar precio unitario libremente
    const handleUnitPriceChange = (cartItemId: string, newPrice: number) => {
        setCart((prevCart) =>
            prevCart.map((item) => (item.id === cartItemId ? { ...item, unit_price: Math.max(0, newPrice) } : item))
        );
    };

    // Modificar cantidad en carrito
    const handleQuantityChange = (cartItemId: string, newQty: number) => {
        const item = cart.find((i) => i.id === cartItemId);
        if (!item) return;

        if (item.product_id && item.product) {
            const maxStock = getStockForBranch(item.product, currentBranchId);
            if (newQty > maxStock) {
                alert(`La cantidad excede el stock disponible (${maxStock}) en la sucursal.`);
                return;
            }
        }

        if (newQty <= 0) {
            removeFromCart(cartItemId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i))
        );
    };

    // Remover del carrito
    const removeFromCart = (cartItemId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
    };

    // Cálculos de totales separados
    const productsSubtotal = cart
        .filter((item) => item.item_type === 'product')
        .reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    const servicesSubtotal = cart
        .filter((item) => item.item_type === 'service')
        .reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

    const subtotal = productsSubtotal + servicesSubtotal;
    const taxAmount = (subtotal - globalDiscount) * (taxRate / 100);
    const grandTotal = Math.max(0, subtotal - globalDiscount + taxAmount);

    // Cambio de sucursal
    const handleBranchSwitch = (newBranchId: number) => {
        if (cart.length > 0) {
            if (!confirm('Al cambiar de sucursal, se verificará la disponibilidad de stock en la nueva sucursal. ¿Deseas continuar?')) {
                return;
            }
        }
        setCurrentBranchId(newBranchId);
    };

    // Enviar formulario de Venta
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('El carrito está vacío. Agrega productos o servicios para realizar la venta.');
            return;
        }

        const payload = {
            branch_id: currentBranchId,
            customer_id: selectedCustomerId ? Number(selectedCustomerId) : null,
            sale_type: 'retail',
            discount: globalDiscount,
            tax: taxAmount,
            items: cart.map((item) => ({
                product_id: item.product_id,
                item_type: item.item_type,
                mechanic_id: item.mechanic_id ?? null,
                description: item.description,
                price_type_id: item.price_type_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount,
            })),
        };

        router.post('/sales', payload);
    };

    return (
        <>
            <Head title="Nueva Venta - POS" />

            <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
                {/* Topbar del POS */}
                <header className="flex items-center justify-between border-b bg-card px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/sales"
                            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="size-4" />
                            Regresar a Ventas
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Caja / Terminal POS</h1>
                    </div>

                    {/* Selector de Sucursal */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm">
                            <Building2 className="size-4 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Sucursal:</span>
                            <select
                                value={currentBranchId}
                                onChange={(e) => handleBranchSwitch(Number(e.target.value))}
                                className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
                            >
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                {/* Main POS Container */}
                <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
                    {/* Sección Izquierda: Catálogo y Buscador de Productos (7 Cols) */}
                    <div className="flex flex-col border-r bg-muted/20 p-4 lg:col-span-7 overflow-y-auto">
                        {/* Buscador, Categorías & Botón Agregar Servicio */}
                        <div className="mb-4 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar refacción por SKU, código o nombre..."
                                        className="w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => setShowServiceModal(true)}
                                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2.5 shrink-0 shadow-sm"
                                >
                                    <Wrench className="size-4" />
                                    + Agregar Servicio / Mano de Obra
                                </Button>
                            </div>

                            {/* Chips de Categorías */}
                            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategoryId('')}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                        selectedCategoryId === ''
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-card text-muted-foreground hover:bg-muted border'
                                    }`}
                                >
                                    Todas
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategoryId(String(cat.id))}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                            selectedCategoryId === String(cat.id)
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'bg-card text-muted-foreground hover:bg-muted border'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid de Productos */}
                        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 auto-rows-max">
                            {filteredProducts.map((product) => {
                                const stock = getStockForBranch(product, currentBranchId);
                                const isOutOfStock = stock <= 0;

                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => !isOutOfStock && addToCart(product)}
                                        className={`group relative flex flex-col justify-between rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md ${
                                            isOutOfStock
                                                ? 'opacity-60 cursor-not-allowed bg-muted/40'
                                                : 'cursor-pointer hover:border-primary/50 hover:scale-[1.01]'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-1">
                                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                    SKU: {product.sku}
                                                </span>
                                                <Badge
                                                    variant={isOutOfStock ? 'destructive' : stock <= 5 ? 'outline' : 'secondary'}
                                                    className={`text-[10px] px-1.5 py-0 font-bold ${
                                                        !isOutOfStock && stock <= 5 ? 'border-amber-500 text-amber-600 bg-amber-50' : ''
                                                    }`}
                                                >
                                                    Stock: {stock}
                                                </Badge>
                                            </div>

                                            <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className="mt-3 border-t pt-2">
                                            <div className="mb-2 space-y-0.5">
                                                {priceTypes.map((pt) => {
                                                    const priceVal = getPriceForType(product, pt.id);
                                                    return (
                                                        <div key={pt.id} className="flex justify-between text-[11px]">
                                                            <span className="text-muted-foreground">{pt.name}:</span>
                                                            <span className="font-semibold text-foreground">${priceVal.toFixed(2)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                type="button"
                                                disabled={isOutOfStock}
                                                size="sm"
                                                className="w-full h-8 text-xs font-semibold gap-1"
                                            >
                                                <Plus className="size-3.5" />
                                                {isOutOfStock ? 'Agotado' : 'Agregar Refacción'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredProducts.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    No se encontraron productos que coincidan con la búsqueda.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección Derecha: Carrito de Compras & Cobro (5 Cols) */}
                    <div className="flex flex-col bg-card lg:col-span-5 border-l">
                        {/* Cabecera del Carrito */}
                        <div className="border-b p-3 bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-foreground">
                                <ShoppingCart className="size-5 text-primary" />
                                Ticket de Venta ({cart.length} {cart.length === 1 ? 'ítem' : 'ítems'})
                            </div>
                            {cart.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setCart([])}
                                    className="text-xs font-medium text-destructive hover:underline"
                                >
                                    Vaciar carrito
                                </button>
                            )}
                        </div>

                        {/* Cliente Selector (Opcional) */}
                        <div className="border-b px-4 py-2 bg-background flex items-center gap-2">
                            <UserIcon className="size-4 text-muted-foreground" />
                            <select
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="w-full bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                            >
                                <option value="">Público general (Sin cliente)</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.phone ? `(${c.phone})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lista de Ítems en Carrito */}
                        <div className="flex-1 overflow-y-auto p-4 divide-y">
                            {cart.map((item) => {
                                const assignedMechanic = item.mechanic_id
                                    ? mechanicsList.find((m) => m.id === item.mechanic_id)
                                    : null;

                                return (
                                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h4 className="text-xs font-bold text-foreground line-clamp-1">
                                                        {item.description || item.product?.name}
                                                    </h4>
                                                    {item.is_service && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500 text-amber-600 bg-amber-50 gap-1 font-semibold">
                                                            <Wrench className="size-2.5" /> Servicio
                                                        </Badge>
                                                    )}
                                                </div>
                                                {item.product && (
                                                    <span className="text-[10px] text-muted-foreground">SKU: {item.product.sku}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-muted-foreground hover:text-destructive p-0.5"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>

                                        {/* Selector de Mecánico para Servicios */}
                                        {item.is_service && (
                                            <div className="flex items-center justify-between gap-2 bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-md border border-amber-200/50 dark:border-amber-900/50 text-xs">
                                                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-medium">
                                                    <Wrench className="size-3.5" />
                                                    <span>Mecánico:</span>
                                                </div>
                                                <select
                                                    value={item.mechanic_id ?? ''}
                                                    onChange={(e) =>
                                                        handleItemMechanicChange(
                                                            item.id,
                                                            e.target.value ? Number(e.target.value) : null
                                                        )
                                                    }
                                                    className="rounded border border-amber-300 dark:border-amber-800 bg-background px-2 py-0.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                                >
                                                    <option value="">Sin mecánico asignado</option>
                                                    {mechanicsList.map((m) => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Selector de Tipo de Precio (Solo para Productos) */}
                                        {!item.is_service && item.product && (
                                            <div className="flex items-center justify-between gap-2 bg-muted/30 p-2 rounded-md">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Tag className="size-3.5 text-primary" />
                                                    <span className="font-semibold text-muted-foreground">Precio:</span>
                                                </div>
                                                <select
                                                    value={item.price_type_id ?? ''}
                                                    onChange={(e) => handlePriceTypeChange(item.id, Number(e.target.value))}
                                                    className="rounded border bg-background px-2 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                                >
                                                    {priceTypes.map((pt) => {
                                                        const pVal = getPriceForType(item.product!, pt.id);
                                                        return (
                                                            <option key={pt.id} value={pt.id}>
                                                                {pt.name} (${pVal.toFixed(2)})
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        )}

                                        {/* Cantidad y Precio Unitario Ajustable */}
                                        <div className="flex items-center justify-between gap-3 pt-1">
                                            <div className="flex items-center gap-1 border rounded-md p-1 bg-background">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    className="p-1 hover:bg-muted rounded text-foreground"
                                                >
                                                    <Minus className="size-3" />
                                                </button>
                                                <span className="px-2 text-xs font-bold w-7 text-center">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-muted rounded text-foreground"
                                                >
                                                    <Plus className="size-3" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                                                    P. Unit: $
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleUnitPriceChange(item.id, parseFloat(e.target.value) || 0)}
                                                        className="w-16 rounded border px-1 text-right text-[11px] font-semibold bg-background"
                                                    />
                                                </div>
                                                <div className="text-sm font-bold text-foreground mt-0.5">
                                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {cart.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
                                    <ShoppingCart className="size-12 stroke-1 mb-2 text-muted-foreground/50" />
                                    <p className="text-sm font-medium">El carrito está vacío</p>
                                    <p className="text-xs">Selecciona refacciones a la izquierda o agrega servicios</p>
                                </div>
                            )}
                        </div>

                        {/* Pie de Carrito & Resumen de Cobro con Desglose */}
                        <div className="border-t bg-muted/20 p-4 space-y-3">
                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Refacciones:</span>
                                    <span className="font-semibold text-foreground">${productsSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Servicios / Mano de obra:</span>
                                    <span className="font-semibold text-amber-600">${servicesSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 font-medium text-foreground">
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {globalDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Descuento:</span>
                                        <span>-${globalDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-foreground border-t pt-2">
                                    <span>TOTAL:</span>
                                    <span className="text-primary">${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={cart.length === 0}
                                className="w-full py-6 text-base font-bold tracking-wide shadow-md transition-all gap-2"
                            >
                                <CheckCircle2 className="size-5" />
                                COBRAR (${grandTotal.toFixed(2)})
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para Agregar Servicio / Mano de Obra */}
            {showServiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
                                <Wrench className="size-5" />
                                Agregar Servicio / Mano de Obra
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowServiceModal(false);
                                    setIsCreatingMechanic(false);
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddServiceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Descripción del Servicio / Mano de Obra <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    placeholder="Ej: Cambio de balatas, afinación mayor, mano de obra..."
                                    className="w-full rounded-md border bg-background p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    autoFocus
                                />
                            </div>

                            {/* Asignación de Mecánico */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-foreground">
                                        Mecánico Asignado
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingMechanic(!isCreatingMechanic)}
                                        className="text-[11px] text-amber-600 hover:underline font-semibold"
                                    >
                                        {isCreatingMechanic ? 'Seleccionar existente' : '+ Registrar nuevo mecánico'}
                                    </button>
                                </div>

                                {isCreatingMechanic ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMechanicName}
                                            onChange={(e) => setNewMechanicName(e.target.value)}
                                            placeholder="Nombre completo del mecánico..."
                                            className="flex-1 rounded-md border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleCreateQuickMechanic}
                                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-2 shrink-0"
                                        >
                                            Guardar
                                        </Button>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedMechanicId}
                                        onChange={(e) => setSelectedMechanicId(e.target.value)}
                                        className="w-full rounded-md border bg-background p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                    >
                                        <option value="">Sin asignar / Ninguno</option>
                                        {mechanicsList.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                        Precio ($) <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={servicePrice}
                                        onChange={(e) => setServicePrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full rounded-md border bg-background p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={serviceQty}
                                        onChange={(e) => setServiceQty(e.target.value)}
                                        className="w-full rounded-md border bg-background p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowServiceModal(false);
                                        setIsCreatingMechanic(false);
                                    }}
                                    className="text-xs"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                                >
                                    Agregar Servicio
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}


