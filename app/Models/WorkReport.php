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
        'voice_mails',
        'interested_count',
        'not_interested_count',
        'emails',
        'whatsapp',
        'sms',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}