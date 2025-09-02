<?php

namespace App\Providers;

use App\Models\WorkReport;
use App\Policies\WorkReportPolicy;
use App\Models\LeaveType;
use App\Policies\LeaveTypePolicy;
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
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}