<?php

namespace App\Providers;

use App\Models\WorkReport;
use App\Policies\WorkReportPolicy;
use App\Models\LeaveType;
use App\Policies\LeaveTypePolicy;
use App\Models\CompetencyAssessment;
use App\Policies\CompetencyAssessmentPolicy;
use App\Models\Employee;
use App\Policies\EmployeePolicy;
use App\Models\Department;
use App\Policies\DepartmentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        WorkReport::class => WorkReportPolicy::class,
        LeaveType::class => LeaveTypePolicy::class,
        CompetencyAssessment::class => CompetencyAssessmentPolicy::class,
        Employee::class => EmployeePolicy::class,
        Department::class => DepartmentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}