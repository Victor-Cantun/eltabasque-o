<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {

            $branches = $data['branches'];
            $primaryBranchId = $data['primary_branch_id'];
            $roles = $data['roles'] ?? [];

            unset(
                $data['branches'],
                $data['primary_branch_id'],
                $data['roles']
            );

            $data['password'] = Hash::make($data['password']);

            $user = User::create($data);

            $branchData = [];

            foreach ($branches as $branchId) {
                $branchData[$branchId] = [
                    'is_primary' => (int) $branchId === (int) $primaryBranchId,
                ];
            }

            $user->branches()->sync($branchData);

            $user->roles()->sync($roles);

            return $user->load([
                'branches',
                'roles',
            ]);
        });
    }

    public function update(
        User $user,
        array $data
    ): User {
        return DB::transaction(function () use ($user, $data) {

            $branches = $data['branches'];
            $primaryBranchId = $data['primary_branch_id'];
            $roles = $data['roles'] ?? [];

            unset(
                $data['branches'],
                $data['primary_branch_id'],
                $data['roles']
            );

            if (
                empty($data['password'])
            ) {
                unset($data['password']);
            } else {
                $data['password'] = Hash::make(
                    $data['password']
                );
            }

            $user->update($data);

            $branchData = [];

            foreach ($branches as $branchId) {
                $branchData[$branchId] = [
                    'is_primary' => (int) $branchId === (int) $primaryBranchId,
                ];
            }

            $user->branches()->sync($branchData);

            $user->roles()->sync($roles);

            return $user->fresh([
                'branches',
                'roles',
            ]);
        });
    }
}
