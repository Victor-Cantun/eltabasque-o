// resources/js/Pages/Products/Import.tsx
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Branch { id: number; name: string; }
interface ImportSummary { imported: number; skipped: number; errors: string[]; }

export default function Import({ branches, importSummary }: { branches: Branch[]; importSummary?: ImportSummary }) {
    const { data, setData, post, processing, progress, errors } = useForm<{
        file: File | null;
        branch_id: string;
    }>({ file: null, branch_id: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/products/import', { forceFormData: true });
        //post(route('products.import.store'), { forceFormData: true });
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
                    <label className="block text-sm font-medium mb-1">Archivo (.xlsx, .xls, .csv)</label>
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                        className="w-full border rounded p-2"
                    />
                    {errors.file && <p className="text-red-600 text-sm">{errors.file}</p>}
                </div>

                {progress && (
                    <div className="w-full bg-gray-200 rounded h-2">
                        <div className="bg-blue-600 h-2 rounded" style={{ width: `${progress.percentage}%` }} />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {processing ? 'Importando…' : 'Importar'}
                </button>
            </form>

            {importSummary && (
                <div className="mt-6 border rounded p-4">
                    <p className="text-green-700">Importados: {importSummary.imported}</p>
                    <p className="text-gray-600">Omitidos (sin código/nombre): {importSummary.skipped}</p>
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