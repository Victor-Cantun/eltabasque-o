// resources/js/Pages/Products/Import.tsx
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Branch { id: number; name: string; }
interface ImportSummary {
    dry_run: boolean;
    created: number;
    existing: number;
    skipped: number;
    errors: string[];
}

type Mode = 'missing_only' | 'inventory';

export default function Import({ branches, importSummary }: { branches: Branch[]; importSummary?: ImportSummary }) {
    const { data, setData, post, processing, progress, errors } = useForm<{
        file: File | null;
        branch_id: string;
        mode: Mode;
        dry_run: boolean;
    }>({ file: null, branch_id: '', mode: 'missing_only', dry_run: true });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/products/import', { forceFormData: true });
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-xl font-semibold mb-4">Importar productos desde Excel</h1>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Sucursal</label>
                    <select
                        className="w-full border rounded p-2"
                        value={data.branch_id}
                        onChange={(e) => setData('branch_id', e.target.value)}
                    >
                        <option value="">Selecciona una sucursal</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    {errors.branch_id && <p className="text-red-600 text-sm">{errors.branch_id}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Modo de importación</label>
                    <select
                        className="w-full border rounded p-2"
                        value={data.mode}
                        onChange={(e) => setData('mode', e.target.value as Mode)}
                    >
                        <option value="missing_only">Solo crear productos faltantes (no toca existentes)</option>
                        <option value="inventory">Cargar inventario de la sucursal (crea faltantes y actualiza stock)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        {data.mode === 'missing_only'
                            ? 'Los productos que ya existen no se modifican (ni precios ni stock).'
                            : 'Actualiza el stock de esta sucursal. Se rechaza si la sucursal ya tiene ventas.'}
                    </p>
                    {errors.mode && <p className="text-red-600 text-sm">{errors.mode}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Archivo (.xlsx, .xls, .csv)</label>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                        className="w-full border rounded p-2"
                    />
                    {errors.file && <p className="text-red-600 text-sm">{errors.file}</p>}
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={data.dry_run}
                        onChange={(e) => setData('dry_run', e.target.checked)}
                    />
                    Solo simular (no guarda nada)
                </label>

                {progress && (
                    <div className="w-full bg-gray-200 rounded h-2">
                        <div className="bg-blue-600 h-2 rounded" style={{ width: `${progress.percentage}%` }} />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className={`text-white px-4 py-2 rounded disabled:opacity-50 ${data.dry_run ? 'bg-blue-600' : 'bg-red-600'}`}
                >
                    {processing ? 'Procesando…' : data.dry_run ? 'Simular importación' : 'Importar de verdad'}
                </button>
            </form>

            {importSummary && (
                <div className="mt-6 border rounded p-4">
                    {importSummary.dry_run && (
                        <p className="mb-2 text-sm font-medium text-amber-700">
                            Simulación: no se guardó nada.
                        </p>
                    )}
                    <p className="text-green-700">Productos nuevos: {importSummary.created}</p>
                    <p className="text-gray-700">Ya existían: {importSummary.existing}</p>
                    <p className="text-gray-600">Omitidos (sin código/nombre o repetidos): {importSummary.skipped}</p>
                    {importSummary.errors.length > 0 && (
                        <div className="mt-2">
                            <p className="text-red-700 font-medium">Errores:</p>
                            <ul className="list-disc pl-5 text-sm text-red-600">
                                {importSummary.errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}