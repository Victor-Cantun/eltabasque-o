<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'confirmed',
                Password::defaults(),
            ],

            'branches' => [
                'required',
                'array',
                'min:1',
            ],

            'branches.*' => [
                'required',
                'exists:branches,id',
            ],

            'primary_branch_id' => [
                'required',
                'exists:branches,id',
            ],

            'roles' => [
                'nullable',
                'array',
            ],
            'roles.*' => [
                'exists:roles,id',
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
                    ! in_array((int) $primaryBranch, array_map('intval', $branches))
                ) {
                    $validator->errors()->add(
                        'primary_branch_id',
                        'La sucursal principal debe pertenecer a las sucursales asignadas.'
                    );
                }
            },
        ];
    }
}
