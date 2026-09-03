<?php
namespace App\Imports;

use App\Models\Product;
use App\Models\PriceType;
use App\Models\ProductPrice;
use App\Models\Inventory;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;

class ProductsImport implements ToCollection, WithStartRow
{
    protected array $priceTypeIds = [];
    public array $errors = [];
    public int $imported = 0;
    public int $skipped = 0;

    public function __construct(protected int $branchId)
    {
        // Cachea los ids de price_types por slug para no consultarlos en cada fila
        $this->priceTypeIds = PriceType::pluck('id', 'slug')->all();
    }

    // Si tu excel tiene fila de encabezados en la fila 1, los datos empiezan en la 2
    public function startRow(): int
    {
        return 2;
    }

public function collection(Collection $collection): void
{
    foreach ($collection as $index => $row) {
        $rowNumber = $index + $this->startRow();

        $internalCode = trim((string) ($row[1] ?? ''));
        $name = trim((string) ($row[3] ?? ''));

        if ($internalCode === '' || $name === '') {
            $this->skipped++;
            continue;
        }

        try {
            DB::transaction(function () use ($row, $internalCode, $name) {
                $product = Product::updateOrCreate(
                    ['internal_code' => $internalCode],
                    [
                        'original_code' => $this->nullableString($row[2] ?? null),
                        'name'          => $name,
                        'cost'          => $this->toDecimal($row[7] ?? 0),
                    ]
                );

                $this->savePrice($product->id, 'wholesale', $row[4] ?? null);
                $this->savePrice($product->id, 'mechanic', $row[5] ?? null);
                $this->savePrice($product->id, 'public', $row[6] ?? null);

                Inventory::updateOrCreate(
                    ['branch_id' => $this->branchId, 'product_id' => $product->id],
                    ['stock' => $this->toDecimal($row[0] ?? 0)]
                );
            });

            $this->imported++;
        } catch (\Throwable $e) {
            $this->errors[] = "Fila {$rowNumber} ({$internalCode}): " . $e->getMessage();
        }
    }
}

    protected function savePrice(int $productId, string $slug, $value): void
    {
        if (!isset($this->priceTypeIds[$slug]) || $value === null || $value === '') {
            return;
        }

        ProductPrice::updateOrCreate(
            ['product_id' => $productId, 'price_type_id' => $this->priceTypeIds[$slug]],
            ['price' => $this->toDecimal($value)]
        );
    }

    protected function toDecimal($value): float
    {
        // Limpia formatos como "$1,234.50"
        return (float) str_replace([',', '$', ' '], '', (string) $value) ?: 0;
    }

    protected function nullableString($value): ?string
    {
        $value = trim((string) $value);
        return $value === '' ? null : $value;
    }
}