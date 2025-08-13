<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'calls',
        'emails',
        'whatsapp',
        'sms',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}