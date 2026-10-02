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
use App\Models\InventoryMovement;


class ProductsImport implements ToCollection, WithStartRow
{
    public const MODE_MISSING_ONLY = 'missing_only';
    public const MODE_INVENTORY    = 'inventory';

    protected array $priceTypeIds = [];
    protected array $seen = [];
    public array $errors = [];
    public int $created = 0;    // productos nuevos
    public int $existing = 0;   // productos que ya existían
    public int $skipped = 0;

    public function __construct(
        protected int $branchId,
        protected string $mode = self::MODE_MISSING_ONLY,
    ) {
        $this->priceTypeIds = PriceType::pluck('id', 'slug')->all();
    }

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

            if (isset($this->seen[$internalCode])) {
                $this->skipped++;
                $this->errors[] = "Fila {$rowNumber} ({$internalCode}): código interno repetido en el archivo, se omitió.";
                continue;
            }
            $this->seen[$internalCode] = true;

            try {
                $result = DB::transaction(function () use ($row, $internalCode, $name) {
                    $product = Product::where('internal_code', $internalCode)->first();

                    if ($product === null) {
                        $product = Product::create([
                            'internal_code' => $internalCode,
                            'original_code' => $this->nullableString($row[2] ?? null),
                            'name'          => $name,
                            'cost'          => $this->toDecimal($row[7] ?? 0),
                        ]);

                        $this->savePrice($product->id, 'wholesale', $row[4] ?? null);
                        $this->savePrice($product->id, 'mechanic', $row[5] ?? null);
                        $this->savePrice($product->id, 'public', $row[6] ?? null);
                        $this->setStock($product->id, $row[0] ?? 0);

                        return 'created';
                    }

                    if ($this->mode === self::MODE_INVENTORY) {
                        $this->setStock($product->id, $row[0] ?? 0);
                    }

                    return 'existing';
                });

                $result === 'created' ? $this->created++ : $this->existing++;
            } catch (\Throwable $e) {
                $this->errors[] = "Fila {$rowNumber} ({$internalCode}): " . $e->getMessage();
            }
        }
    }

    protected function setStock(int $productId, $value): void
    {
        $inventory = Inventory::firstOrNew([
            'branch_id'  => $this->branchId,
            'product_id' => $productId,
        ]);

        $before = (float) ($inventory->stock ?? 0);
        $after  = $this->toDecimal($value);

        $inventory->stock = $after;
        $inventory->save();

        // AJUSTA las columnas/tipo a tu tabla inventory_movements
        InventoryMovement::create([
            'branch_id'    => $this->branchId,
            'product_id'   => $productId,
            'type'         => 'initial',
            'quantity'     => $after - $before,
            'stock_before' => $before,
            'stock_after'  => $after,
            'user_id'      => auth()->id(),
        ]);
    }

    // savePrice, toDecimal y nullableString quedan igual
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