<?php
namespace App\Http\Controllers;

use App\Imports\ProductsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductImportController extends Controller
{
    public function create()
    {
        return Inertia::render('products/Import', [
            'branches' => \App\Models\Branch::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
            'branch_id' => ['required', 'exists:branches,id'],
        ]);

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