<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierRequest extends FormRequest
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
            'business_name' => [
                'required',
                'string',
                'max:200',
                'unique:suppliers,bussiness_name'
            ],
            'rfc' => [
                'nullable',
                'string',
                'max:15',
            ],   
            'contact_name' => [
                'required',
                'string',
                'max:100',
            ],  
            'phone' => [
                'nullable',
                'string',
                'max:30',
            ], 
            'email' => [
                'nullable',
                'string',
                'max:255',
                'unique:suppliers,email',
            ],  
            'address' => [
                'nullable',
                'string',
                'max:255',
            ], 
            'active' => [
                'required',
                'boolean',
            ],                                                                         
        ];
    }
    public function attributes(): array
    {
        return [
            'business_name' => 'nombre del proveedor',
            'rfc' => 'rfc del proveedor',
            'contact_name' => 'nombre del contácto',
            'phone' => 'teléfono',
            'email' => 'correo electrónico',
            'address' => 'domicilio del proveedor',
            'active' => 'estado',
        ];
    }      
}
