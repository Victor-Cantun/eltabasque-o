<?php

namespace App\Http\Controllers;

use App\Imports\ProductsImport;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
            'branch_id' => ['required', 'exists:branches,id'],
        ]);
        set_time_limit(300);
        $import = new ProductsImport($request->integer('branch_id'));
        Excel::import($import, $request->file('file'));

        return back()->with([
            'importSummary' => [
                'imported' => $import->imported,
                'skipped' => $import->skipped,
                'errors' => $import->errors,
            ],
        ]);
    }
}
