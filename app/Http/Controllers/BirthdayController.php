<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Services\BirthdayService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BirthdayController extends Controller
{
    protected BirthdayService $birthdayService;

    public function __construct(BirthdayService $birthdayService)
    {
        $this->birthdayService = $birthdayService;
    }

    /**
     * Send birthday wishes (triggered from popup)
     */
    public function sendWishes(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'employee_id' => 'required|exists:employees,id'
            ]);

            $employee = Employee::with('user')->findOrFail($request->employee_id);
            
            // Verify the employee has a birthday today
            $todaysBirthdays = $this->birthdayService->getTodaysBirthdays();
            $hasBirthdayToday = $todaysBirthdays->contains('id', $employee->id);
            
            if (!$hasBirthdayToday) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee does not have a birthday today'
                ], 400);
            }

            // Log the birthday wish interaction
            Log::info("Birthday wishes sent via popup", [
                'employee_id' => $employee->id,
                'employee_name' => $employee->user->name,
                'sent_by' => Auth::user()->name,
                'sent_by_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Birthday wishes sent successfully!',
                'employee' => [
                    'name' => $employee->user->name,
                    'job_title' => $employee->job_title
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send birthday wishes", [
                'error' => $e->getMessage(),
                'employee_id' => $request->employee_id ?? null,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send birthday wishes'
            ], 500);
        }
    }

    /**
     * Get current user's birthday status
     */
    public function getCurrentUserBirthdayStatus(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->employee) {
                return response()->json([
                    'has_birthday_today' => false,
                    'employee' => null
                ]);
            }

            $todaysBirthdays = $this->birthdayService->getTodaysBirthdays();
            $currentUserBirthday = $todaysBirthdays->firstWhere('user_id', $user->id);

            return response()->json([
                'has_birthday_today' => !is_null($currentUserBirthday),
                'employee' => $currentUserBirthday ? [
                    'id' => $currentUserBirthday->id,
                    'user' => [
                        'name' => $currentUserBirthday->user->name,
                        'email' => $currentUserBirthday->user->email,
                    ],
                    'job_title' => $currentUserBirthday->job_title,
                    'department' => $currentUserBirthday->department ? $currentUserBirthday->department->name : null,
                    'age' => $currentUserBirthday->getAge(),
                ] : null
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to get birthday status", [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'has_birthday_today' => false,
                'employee' => null
            ], 500);
        }
    }

    /**
     * Get birthday statistics for dashboard
     */
    public function getBirthdayStats(): JsonResponse
    {
        try {
            $stats = $this->birthdayService->getBirthdayStats();
            
            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to get birthday stats", [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get birthday statistics'
            ], 500);
        }
    }
}