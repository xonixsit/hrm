<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Idea extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'title', 'description', 'category',
        'status', 'votes', 'admin_notes', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'votes'       => 'integer',
    ];

    public function user()      { return $this->belongsTo(User::class); }
    public function reviewer()  { return $this->belongsTo(User::class, 'reviewed_by'); }
    public function voters()    { return $this->belongsToMany(User::class, 'idea_votes')->withTimestamps(); }

    public static array $categories = [
        'lead_conversion'  => '📞 Lead Conversion',
        'sales_strategy'   => '📈 Sales Strategy',
        'client_retention' => '🤝 Client Retention',
        'tax_consultation' => '🧾 Tax Consultation',
        'payment_process'  => '💳 Payment Process',
        'team_process'     => '👥 Team Process',
        'other'            => '💡 Other',
    ];

    public static array $statuses = [
        'pending'       => ['label' => 'Pending',       'color' => 'gray'],
        'under_review'  => ['label' => 'Under Review',  'color' => 'blue'],
        'approved'      => ['label' => 'Approved',      'color' => 'green'],
        'implemented'   => ['label' => 'Implemented',   'color' => 'teal'],
        'declined'      => ['label' => 'Declined',      'color' => 'red'],
    ];
}
