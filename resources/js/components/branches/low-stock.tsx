// resources/js/components/branches/low-stock.tsx
import { AlertTriangle } from 'lucide-react';

type LowStockProduct = {
    id: number;
    name: string;
    internal_code: string;
    stock: number | string;
    minimum_stock: number | string;
};

type Props = {
    products: LowStockProduct[];
    loading?: boolean;
};

export default function LowStock({ products, loading }: Props) {
    return (
        <div className="rounded-lg border">
            <div className="flex items-center gap-2 border-b bg-red-50/50 px-3 py-2 text-xs font-semibold dark:bg-red-950/20">
                <AlertTriangle className="size-3.5 text-red-600" />
                Stock bajo
            </div>
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b text-muted-foreground">
                        <th className="px-3 py-1.5 text-left font-medium">Producto</th>
                        <th className="px-3 py-1.5 text-center font-medium">Stock</th>
                        <th className="px-3 py-1.5 text-center font-medium">Mínimo</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {loading ? (
                        <tr>
                            <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                Cargando...
                            </td>
                        </tr>
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                Sin alertas de stock
                            </td>
                        </tr>
                    ) : (
                        products.map((p) => (
                            <tr key={p.id} className="bg-red-50/30 dark:bg-red-950/10">
                                <td className="px-3 py-1.5">
                                    <span className="block truncate max-w-[10rem]" title={p.name}>
                                        {p.name}
                                    </span>
                                    <span className="text-muted-foreground">{p.internal_code}</span>
                                </td>
                                <td className="px-3 py-1.5 text-center font-bold text-red-600">
                                    {Number(p.stock)}
                                </td>
                                <td className="px-3 py-1.5 text-center text-muted-foreground">
                                    {Number(p.minimum_stock)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}