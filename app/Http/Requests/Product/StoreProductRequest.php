<?php

namespace App\Http\Requests\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'internal_code' => [
                'required',
                'string',
                'max:100',
                'unique:products,internal_code',
            ],
            'original_code' => [
                'nullable',
                'string',
                'max:100',
                'unique:products,original_code',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'category_id' => [
                'nullable',
                'exists:categories,id',
            ],
            'brand_id' => [
                'nullable',
                'exists:brands,id',
            ],
            'image' => [
                'nullable',
                'image',
                'max:2048',
            ],
            'cost' => [
                'required',
                'numeric',
                'min:0',
            ],
            'active' => [
                'boolean',
            ],
            'prices' => [
                'required',
                'array',
                'min:1',
            ],
            'prices.*.price_type_id' => [
                'required',
                'exists:price_types,id',
            ],
            'prices.*.price' => [
                'required',
                'numeric',
                'min:0',
            ],
        ];
    }
    public function attributes(): array
    {
        return [
            'internal_code' => 'Código interno',
            'original_code' => 'Código original',
            'name' => 'producto',
            'description' => 'descripción',
            'category_id' => 'categoria',
            'brand_id' => 'marca',
            'image' => 'imagen del producto',
            'cost' => 'costo',
            'active' => 'activo',
            'price' => 'precio',
        ];
    }
}
