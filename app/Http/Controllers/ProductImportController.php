<?php

namespace App\Http\Controllers;

use App\Imports\ProductsImport;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\Rule;

//use App\Imports\ProductsImport;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
//use Maatwebsite\Excel\Facades\Excel;

class ProductImportController extends Controller
{
    public function create()
    {
        return Inertia::render('products/Import', [
            'branches' => Branch::select('id', 'name')->get(),
        ]);
        //return 'ENTRÓ AL CONTROLLER';
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'file'      => ['required', 'file', 'mimes:xlsx,xls,csv'],
            'branch_id' => ['required', 'exists:branches,id'],
            'mode'      => ['required', Rule::in([ProductsImport::MODE_MISSING_ONLY, ProductsImport::MODE_INVENTORY])],
            'dry_run'   => ['boolean'],
        ]);

        if ($data['mode'] === ProductsImport::MODE_INVENTORY
            && Sale::where('branch_id', $data['branch_id'])->exists()) {
            return back()->withErrors([
                'branch_id' => 'Esta sucursal ya tiene ventas; no se puede sobrescribir su inventario.',
            ]);
        }

        set_time_limit(300);
        $dryRun = $request->boolean('dry_run');
        $import = new ProductsImport((int) $data['branch_id'], $data['mode']);

        DB::beginTransaction();
        try {
            Excel::import($import, $request->file('file'));
            $dryRun ? DB::rollBack() : DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return back()->with(['importSummary' => [
            'dry_run' => $dryRun,
            'created' => $import->created,
            'existing' => $import->existing,
            'skipped' => $import->skipped,
            'errors' => $import->errors,
        ]]);
    }
}
