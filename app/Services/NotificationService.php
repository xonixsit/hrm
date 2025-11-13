<?php

namespace App\Services;

use App\Models\CompetencyAssessment;
use App\Models\Leave;
use App\Models\User;
use App\Mail\AssessmentApproved;
use App\Mail\AssessmentAssigned;
use App\Mail\AssessmentRejected;
use App\Mail\AssessmentSubmitted;
use App\Mail\LeaveRequestApproved;
use App\Mail\LeaveRequestRejected;
use App\Mail\LeaveRequestSubmitted;
use App\Mail\DailyDigest;
use App\Mail\WeeklyDigest;
use App\Mail\PendingActionReminder;
use App\Models\EmailPreference;
use App\Jobs\SendNotificationEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Send leave request submitted notification to admins/HR
     */
    public function sendLeaveRequestSubmitted(Leave $leaveRequest): void
    {
        try {
            // Get admin and HR users
            $recipients = $this->getAdminAndHRUsers();
            
            foreach ($recipients as $recipient) {
                // Check user preferences
                if ($this->shouldSendNotification($recipient, 'leave_request_submitted')) {
                    $this->queueEmail($recipient->email, new LeaveRequestSubmitted($leaveRequest), 'leave_submitted');
                }
            }
            
            // Always send to hr@xonobics.com
            $this->queueEmail('hr@xonobics.com', new LeaveRequestSubmitted($leaveRequest), 'leave_submitted');
            
            Log::info('Leave request submitted notification queued', [
                'leave_request_id' => $leaveRequest->id,
                'employee_id' => $leaveRequest->employee_id,
                'recipients_count' => $recipients->count() + 1
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to queue leave request submitted notification', [
                'leave_request_id' => $leaveRequest->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send leave request approved notification to employee
     */
    public function sendLeaveRequestApproved(Leave $leaveRequest): void
    {
        try {
            $employee = $leaveRequest->employee;
            if ($employee && $employee->user && $this->shouldSendNotification($employee->user, 'leave_request_approved')) {
                $this->queueEmail($employee->user->email, new LeaveRequestApproved($leaveRequest), 'leave_approved');
                
                Log::info('Leave request approved notification queued', [
                    'leave_request_id' => $leaveRequest->id,
                    'employee_id' => $leaveRequest->employee_id,
                    'recipient' => $employee->user->email
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to queue leave request approved notification', [
                'leave_request_id' => $leaveRequest->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send leave request rejected notification to employee
     */
    public function sendLeaveRequestRejected(Leave $leaveRequest, string $rejectionReason = ''): void
    {
        try {
            $employee = $leaveRequest->employee;
            if ($employee && $employee->user && $this->shouldSendNotification($employee->user, 'leave_request_rejected')) {
                $this->queueEmail($employee->user->email, new LeaveRequestRejected($leaveRequest, $rejectionReason), 'leave_rejected');
                
                Log::info('Leave request rejected notification queued', [
                    'leave_request_id' => $leaveRequest->id,
                    'employee_id' => $leaveRequest->employee_id,
                    'recipient' => $employee->user->email
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to queue leave request rejected notification', [
                'leave_request_id' => $leaveRequest->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send assessment assigned notification
     */
    public function sendAssessmentAssigned(CompetencyAssessment $assessment): void
    {
        try {
            $recipients = [];
            
            // For self-assessments, notify the employee
            if ($assessment->assessment_type === 'self') {
                if ($assessment->employee && $assessment->employee->user) {
                    $recipients[] = $assessment->employee->user;
                }
            } else {
                // For other assessment types, notify the assessor
                if ($assessment->assessor) {
                    $recipients[] = $assessment->assessor;
                }
            }
            
            foreach ($recipients as $recipient) {
                Mail::to($recipient->email)->send(new AssessmentAssigned($assessment));
            }
            
            Log::info('Assessment assigned notification sent', [
                'assessment_id' => $assessment->id,
                'assessment_type' => $assessment->assessment_type,
                'recipients_count' => count($recipients)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment assigned notification', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send assessment submitted notification to admins/HR and managers
     */
    public function sendAssessmentSubmitted(CompetencyAssessment $assessment): void
    {
        try {
            $recipients = collect();
            
            // Add admin and HR users
            $recipients = $recipients->merge($this->getAdminAndHRUsers());
            
            // Add the employee's manager if different from assessor
            if ($assessment->employee && $assessment->employee->manager_id) {
                $manager = User::find($assessment->employee->manager_id);
                if ($manager && $manager->id !== $assessment->assessor_id) {
                    $recipients->push($manager);
                }
            }
            
            // Remove duplicates
            $recipients = $recipients->unique('id');
            
            foreach ($recipients as $recipient) {
                Mail::to($recipient->email)->send(new AssessmentSubmitted($assessment));
            }
            
            Log::info('Assessment submitted notification sent', [
                'assessment_id' => $assessment->id,
                'assessment_type' => $assessment->assessment_type,
                'recipients_count' => $recipients->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment submitted notification', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send assessment approved notification to employee and assessor
     */
    public function sendAssessmentApproved(CompetencyAssessment $assessment): void
    {
        try {
            $recipients = collect();
            
            // Notify the employee
            if ($assessment->employee && $assessment->employee->user) {
                $recipients->push($assessment->employee->user);
            }
            
            // Notify the assessor if different from employee
            if ($assessment->assessor && $assessment->assessor->id !== $assessment->employee->user_id) {
                $recipients->push($assessment->assessor);
            }
            
            foreach ($recipients as $recipient) {
                Mail::to($recipient->email)->send(new AssessmentApproved($assessment));
            }
            
            Log::info('Assessment approved notification sent', [
                'assessment_id' => $assessment->id,
                'recipients_count' => $recipients->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment approved notification', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send assessment rejected notification to employee and assessor
     */
    public function sendAssessmentRejected(CompetencyAssessment $assessment, string $rejectionReason = ''): void
    {
        try {
            $recipients = collect();
            
            // Notify the employee
            if ($assessment->employee && $assessment->employee->user) {
                $recipients->push($assessment->employee->user);
            }
            
            // Notify the assessor if different from employee
            if ($assessment->assessor && $assessment->assessor->id !== $assessment->employee->user_id) {
                $recipients->push($assessment->assessor);
            }
            
            foreach ($recipients as $recipient) {
                Mail::to($recipient->email)->send(new AssessmentRejected($assessment, $rejectionReason));
            }
            
            Log::info('Assessment rejected notification sent', [
                'assessment_id' => $assessment->id,
                'recipients_count' => $recipients->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send assessment rejected notification', [
                'assessment_id' => $assessment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send daily digest to users who have opted in
     */
    public function sendDailyDigests(): void
    {
        $users = User::whereHas('emailPreferences', function ($query) {
            $query->where('daily_digest', true);
        })->get();

        foreach ($users as $user) {
            $data = $this->getDailyDigestData($user);
            $this->queueEmail($user->email, new DailyDigest($user, $data), 'daily_digest');
        }

        Log::info('Daily digests queued', ['users_count' => $users->count()]);
    }

    /**
     * Send weekly digest to users who have opted in
     */
    public function sendWeeklyDigests(): void
    {
        $users = User::whereHas('emailPreferences', function ($query) {
            $query->where('weekly_digest', true);
        })->get();

        foreach ($users as $user) {
            $data = $this->getWeeklyDigestData($user);
            $this->queueEmail($user->email, new WeeklyDigest($user, $data), 'weekly_digest');
        }

        Log::info('Weekly digests queued', ['users_count' => $users->count()]);
    }

    /**
     * Send pending action reminders
     */
    public function sendPendingReminders(): void
    {
        $users = User::whereHas('emailPreferences', function ($query) {
            $query->where('pending_reminders', true);
        })->get();

        foreach ($users as $user) {
            $pendingItems = $this->getPendingItemsForUser($user);
            
            if (!empty($pendingItems)) {
                $this->queueEmail($user->email, new PendingActionReminder($user, $pendingItems), 'pending_reminder');
            }
        }

        Log::info('Pending reminders processed');
    }

    /**
     * Check if user wants to receive a specific notification type
     */
    private function shouldSendNotification(User $user, string $type): bool
    {
        $preferences = $user->getEmailPreferences();
        return $preferences->wantsNotification($type);
    }

    /**
     * Queue email for sending
     */
    private function queueEmail(string $email, $mailable, string $type): void
    {
        SendNotificationEmail::dispatch($email, $mailable, $type);
    }

    /**
     * Get daily digest data for user
     */
    private function getDailyDigestData(User $user): array
    {
        $today = Carbon::today();
        
        return [
            'pending_leaves' => $this->getPendingLeavesCount($user),
            'pending_assessments' => $this->getPendingAssessmentsCount($user),
            'completed_today' => $this->getCompletedTodayCount($user, $today),
            'recent_leaves' => $this->getRecentLeaves($user, $today),
            'recent_assessments' => $this->getRecentAssessments($user, $today),
            'action_items' => $this->getActionItems($user),
        ];
    }

    /**
     * Get weekly digest data for user
     */
    private function getWeeklyDigestData(User $user): array
    {
        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();
        
        return [
            'total_leaves' => $this->getWeeklyLeavesCount($user, $weekStart, $weekEnd),
            'total_assessments' => $this->getWeeklyAssessmentsCount($user, $weekStart, $weekEnd),
            'approved_items' => $this->getWeeklyApprovedCount($user, $weekStart, $weekEnd),
            'pending_items' => $this->getPendingItemsCount($user),
            'metrics' => $this->getWeeklyMetrics($user, $weekStart, $weekEnd),
            'highlights' => $this->getWeeklyHighlights($user, $weekStart, $weekEnd),
            'top_activities' => $this->getTopActivities($user, $weekStart, $weekEnd),
            'upcoming' => $this->getUpcomingItems($user),
            'team_performance' => $this->getTeamPerformance($user, $weekStart, $weekEnd),
        ];
    }

    /**
     * Get pending items for user reminders
     */
    private function getPendingItemsForUser(User $user): array
    {
        $items = [];
        
        // Check for pending leave requests (if user is admin/HR)
        if ($user->hasAnyRole(['admin', 'hr', 'Admin', 'HR'])) {
            $pendingLeaves = Leave::where('status', 'pending')
                ->with('employee.user', 'leaveType')
                ->get();
                
            foreach ($pendingLeaves as $leave) {
                $daysPending = Carbon::parse($leave->created_at)->diffInDays(Carbon::now());
                $urgency = $daysPending > 3 ? 'high' : ($daysPending > 1 ? 'medium' : 'low');
                
                $items[] = [
                    'title' => 'Leave Request - ' . $leave->employee->user->name,
                    'type' => 'Leave Request',
                    'description' => ($leave->leaveType->name ?? 'Leave') . ' from ' . $leave->from_date . ' to ' . $leave->to_date,
                    'submitted_date' => $leave->created_at->format('M d, Y'),
                    'days_pending' => $daysPending,
                    'employee' => $leave->employee->user->name,
                    'urgency' => $urgency,
                ];
            }
        }
        
        // Check for pending assessments
        $pendingAssessments = CompetencyAssessment::where('status', 'pending')
            ->where(function ($query) use ($user) {
                $query->where('assessor_id', $user->id)
                      ->orWhereHas('employee', function ($q) use ($user) {
                          $q->where('manager_id', $user->id);
                      });
            })
            ->with('employee.user')
            ->get();
            
        foreach ($pendingAssessments as $assessment) {
            $daysPending = Carbon::parse($assessment->created_at)->diffInDays(Carbon::now());
            $urgency = $daysPending > 7 ? 'high' : ($daysPending > 3 ? 'medium' : 'low');
            
            $items[] = [
                'title' => 'Assessment - ' . $assessment->employee->user->name,
                'type' => 'Assessment',
                'description' => ucfirst($assessment->assessment_type) . ' assessment for ' . $assessment->employee->user->name,
                'submitted_date' => $assessment->created_at->format('M d, Y'),
                'days_pending' => $daysPending,
                'employee' => $assessment->employee->user->name,
                'urgency' => $urgency,
            ];
        }
        
        return $items;
    }

    // Helper methods for digest data (simplified implementations)
    private function getPendingLeavesCount(User $user): int
    {
        if (!$user->hasAnyRole(['admin', 'hr', 'Admin', 'HR'])) return 0;
        return Leave::where('status', 'pending')->count();
    }

    private function getPendingAssessmentsCount(User $user): int
    {
        return CompetencyAssessment::where('status', 'pending')
            ->where(function ($query) use ($user) {
                $query->where('assessor_id', $user->id)
                      ->orWhereHas('employee', function ($q) use ($user) {
                          $q->where('manager_id', $user->id);
                      });
            })->count();
    }

    private function getCompletedTodayCount(User $user, Carbon $date): int
    {
        $count = 0;
        
        if ($user->hasAnyRole(['admin', 'hr', 'Admin', 'HR'])) {
            $count += Leave::whereDate('updated_at', $date)
                ->whereIn('status', ['approved', 'rejected'])
                ->count();
        }
        
        $count += CompetencyAssessment::whereDate('updated_at', $date)
            ->whereIn('status', ['approved', 'rejected'])
            ->where('assessor_id', $user->id)
            ->count();
            
        return $count;
    }

    private function getRecentLeaves(User $user, Carbon $date): array
    {
        if (!$user->hasAnyRole(['admin', 'hr', 'Admin', 'HR'])) return [];
        
        return Leave::whereDate('created_at', $date)
            ->with('employee.user', 'leaveType')
            ->get()
            ->map(function ($leave) {
                return [
                    'employee_name' => $leave->employee->user->name,
                    'type' => $leave->leaveType->name ?? 'Leave',
                    'dates' => $leave->from_date . ' to ' . $leave->to_date,
                    'status' => $leave->status,
                ];
            })->toArray();
    }

    private function getRecentAssessments(User $user, Carbon $date): array
    {
        return CompetencyAssessment::whereDate('created_at', $date)
            ->where(function ($query) use ($user) {
                $query->where('assessor_id', $user->id)
                      ->orWhereHas('employee', function ($q) use ($user) {
                          $q->where('manager_id', $user->id);
                      });
            })
            ->with('employee.user')
            ->get()
            ->map(function ($assessment) {
                return [
                    'employee_name' => $assessment->employee->user->name,
                    'type' => ucfirst($assessment->assessment_type),
                    'status' => $assessment->status,
                ];
            })->toArray();
    }

    private function getActionItems(User $user): array
    {
        $items = [];
        
        $pendingCount = $this->getPendingLeavesCount($user) + $this->getPendingAssessmentsCount($user);
        
        if ($pendingCount > 0) {
            $items[] = [
                'title' => "Review {$pendingCount} pending items",
                'description' => 'You have items waiting for your approval or review',
            ];
        }
        
        return $items;
    }

    // Simplified weekly methods (can be expanded)
    private function getWeeklyLeavesCount(User $user, Carbon $start, Carbon $end): int
    {
        if (!$user->hasAnyRole(['admin', 'hr', 'Admin', 'HR'])) return 0;
        return Leave::whereBetween('created_at', [$start, $end])->count();
    }

    private function getWeeklyAssessmentsCount(User $user, Carbon $start, Carbon $end): int
    {
        return CompetencyAssessment::whereBetween('created_at', [$start, $end])
            ->where('assessor_id', $user->id)
            ->count();
    }

    private function getWeeklyApprovedCount(User $user, Carbon $start, Carbon $end): int
    {
        $count = 0;
        
        if ($user->hasAnyRole(['admin', 'hr', 'Admin', 'HR'])) {
            $count += Leave::whereBetween('updated_at', [$start, $end])
                ->where('status', 'approved')
                ->count();
        }
        
        $count += CompetencyAssessment::whereBetween('updated_at', [$start, $end])
            ->where('status', 'approved')
            ->where('assessor_id', $user->id)
            ->count();
            
        return $count;
    }

    private function getPendingItemsCount(User $user): int
    {
        return $this->getPendingLeavesCount($user) + $this->getPendingAssessmentsCount($user);
    }

    private function getWeeklyMetrics(User $user, Carbon $start, Carbon $end): array
    {
        return [
            ['label' => 'Response Time', 'percentage' => 85],
            ['label' => 'Approval Rate', 'percentage' => 92],
            ['label' => 'Team Satisfaction', 'percentage' => 88],
        ];
    }

    private function getWeeklyHighlights(User $user, Carbon $start, Carbon $end): array
    {
        return [
            [
                'title' => 'Great Response Time!',
                'description' => 'You processed requests 20% faster than last week.',
            ],
        ];
    }

    private function getTopActivities(User $user, Carbon $start, Carbon $end): array
    {
        return [
            [
                'title' => 'Leave Approvals',
                'count' => $this->getWeeklyApprovedCount($user, $start, $end),
                'type' => 'approvals',
                'trend' => '↗️ +15%',
            ],
        ];
    }

    private function getUpcomingItems(User $user): array
    {
        return [
            [
                'title' => 'Monthly Team Review',
                'date' => 'Next Monday',
                'type' => 'Meeting',
            ],
        ];
    }

    private function getTeamPerformance(User $user, Carbon $start, Carbon $end): array
    {
        if (!$user->managedEmployees()->exists()) return [];
        
        return $user->managedEmployees()->take(4)->get()->map(function ($employee) {
            return [
                'name' => $employee->user->name ?? 'N/A',
                'score' => rand(85, 98), // Placeholder
            ];
        })->toArray();
    }

    /**
     * Get admin and HR users
     */
    private function getAdminAndHRUsers()
    {
        return User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'hr', 'Admin', 'HR']);
        })->get();
    }
}