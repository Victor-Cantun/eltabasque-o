<?php

namespace App\Http\Requests\Sale;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('sales.create') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'sale_type' => ['nullable', 'string', 'max:20'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_type' => ['nullable', 'string', 'in:product,service'],
            'items.*.product_id' => ['nullable', 'exists:products,id'],
            'items.*.mechanic_id' => ['nullable', 'exists:mechanics,id'],
            'items.*.description' => ['nullable', 'string', 'max:255'],
            'items.*.price_type_id' => ['nullable', 'exists:price_types,id'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit_price' => ['required', 'numeric', 'gte:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'Debe seleccionar una sucursal.',
            'items.required' => 'Debe agregar al menos un producto a la venta.',
            'items.min' => 'Debe agregar al menos un producto a la venta.',
            'items.*.product_id.required' => 'El producto es requerido.',
            'items.*.price_type_id.required' => 'Debe seleccionar el tipo de precio para cada producto.',
            'items.*.quantity.gt' => 'La cantidad debe ser mayor a 0.',
            'items.*.unit_price.gte' => 'El precio unitario no puede ser negativo.',
        ];
    }
}
