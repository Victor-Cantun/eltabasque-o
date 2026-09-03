<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable; // agrega

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password','is_active'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active'=>'boolean',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function permissions()
    {
        return $this->belongsToMany(
            Permission::class,
            'permission_user'
        );
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class)
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function primaryBranch(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class)
            ->wherePivot('is_primary', true)
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    /*public function branches()
    {
        return $this->belongsToMany(Branch::class)->withPivot('is_primary')->withTimestamps();;
    } */

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    /*     public function hasPermission(string $permission): bool
        {
            return $this->roles()
                ->whereHas('permissions', function ($query) use ($permission) {
                    $query->where('slug', $permission);
                })
                ->exists();
        }   */
    public function hasPermission(string $permission): bool
    {
        /*
        |--------------------------------------------------------------------------
        | Administrador
        |--------------------------------------------------------------------------
        */

        if (
            $this->roles()
                ->where(
                    'slug',
                    'administrator'
                )
                ->exists()
        ) {
            return true;
        }

        /*
        |--------------------------------------------------------------------------
        | Permiso normal
        |--------------------------------------------------------------------------
        */

        return $this->roles()
            ->whereHas(
                'permissions',
                function ($query) use ($permission) {

                    $query->where(
                        'slug',
                        $permission
                    );

                }
            )
            ->exists();
    }
}
