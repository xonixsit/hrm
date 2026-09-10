<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Feature extends Model
{
    protected $fillable = ['key', 'label', 'group', 'sort_order'];

    public function rolePermissions(): HasMany
    {
        return $this->hasMany(FeatureRolePermission::class);
    }

    /**
     * Get all role names that have access to this feature.
     */
    public function allowedRoles(): array
    {
        return $this->rolePermissions()->pluck('role_name')->toArray();
    }
}
