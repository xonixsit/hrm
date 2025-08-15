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
        'calls_not_received',
        'disconnected_calls',
        'follow_up_calls',
        'successful_calls',
        'emails',
        'whatsapp',
        'sms',
        'notes',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}