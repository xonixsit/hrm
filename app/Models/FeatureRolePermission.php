<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeatureRolePermission extends Model
{
    protected $fillable = ['feature_id', 'role_name'];

    public function feature(): BelongsTo
    {
        return $this->belongsTo(Feature::class);
    }
}
