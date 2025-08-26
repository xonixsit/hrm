<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Attendance;
use App\Policies\AttendancePolicy;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        if (DB::connection() instanceof \Illuminate\Database\SQLiteConnection) {
            DB::statement(DB::raw('PRAGMA foreign_keys=1'));
        }
    
        Vite::prefetch(concurrency: 3);
        Schema::defaultStringLength(191);

        
        // Register policies
        Gate::policy(Attendance::class, AttendancePolicy::class);
    }
}
