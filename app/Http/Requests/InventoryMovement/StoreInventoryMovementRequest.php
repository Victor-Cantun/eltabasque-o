<?php

namespace App\Http\Requests\InventoryMovement;

use App\Models\InventoryMovement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => [
                'required',
                'exists:branches,id',
            ],

            'product_id' => [
                'required',
                'exists:products,id',
            ],

            'type' => [
                'required',
                Rule::in([
                    InventoryMovement::TYPE_ENTRY,
                    InventoryMovement::TYPE_EXIT,
                    InventoryMovement::TYPE_ADJUSTMENT,
                ]),
            ],

            'quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'reason' => [
                'nullable',
                'string',
                'max:255',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'type.in' => 'Solo puedes registrar entradas, salidas o ajustes manualmente. Ventas y transferencias se generan automáticamente desde sus módulos.',
        ];
    }
}
