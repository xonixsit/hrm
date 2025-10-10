<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeCompetency extends Model
{
    protected $fillable = ['employee_id', 'competency_id', 'level'];
}
