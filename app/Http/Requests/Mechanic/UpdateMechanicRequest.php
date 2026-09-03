<?php

namespace App\Http\Requests\Mechanic;

use App\Models\Mechanic;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMechanicRequest extends FormRequest
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
        $mechanic = $this->route('mechanic');
        $mechanicId = $mechanic instanceof Mechanic ? $mechanic->id : $mechanic;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('mechanics', 'email')
                    ->ignore($mechanicId),
            ],

            'active' => [
                'required',
                'boolean',
            ],

            'branches' => [
                'nullable',
                'array',
            ],

            'branches.*' => [
                'integer',
                'exists:branches,id',
            ],

            'primary_branch_id' => [
                'nullable',
                'integer',
                'exists:branches,id',
            ],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                $branches = $this->input('branches', []);
                $primaryBranch = $this->input('primary_branch_id');

                if (
                    $primaryBranch &&
                    ! empty($branches) &&
                    ! in_array((int) $primaryBranch, array_map('intval', (array) $branches), true)
                ) {
                    $validator->errors()->add(
                        'primary_branch_id',
                        'La sucursal principal debe pertenecer a las sucursales asignadas.'
                    );
                }
            },
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre del mecánico',
            'address' => 'dirección',
            'phone' => 'teléfono',
            'email' => 'correo electrónico',
            'active' => 'estado',
            'branches' => 'sucursales',
            'primary_branch_id' => 'sucursal principal',
        ];
    }
}
