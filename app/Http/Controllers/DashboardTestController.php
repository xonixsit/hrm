<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Employee;
use App\Models\User;
use App\Services\BirthdayService;
use Inertia\Inertia;

class DashboardTestController extends Controller
{
    public function test()
    {
        try {
            // Test basic database connection
            $userCount = User::count();
            
            // Test user authentication
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            // Test role access
            $role = $user->getRoleNames()->first();
            
            // Test employee relationship
            $employee = $user->employee;
            
            // Test birthday service
            $birthdayService = app(BirthdayService::class);
            $todaysBirthdays = $birthdayService->getTodaysBirthdays();
            
            return response()->json([
                'status' => 'success',
                'user_count' => $userCount,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'role' => $role,
                'has_employee' => $employee ? true : false,
                'employee_id' => $employee ? $employee->id : null,
                'birthdays_count' => $todaysBirthdays->count(),
                'message' => 'Dashboard test passed'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}