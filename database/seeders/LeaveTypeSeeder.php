<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeaveType;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $leaveTypes = [
            [
                'name' => 'Annual Leave',
                'quota' => 25,
                'description' => 'Yearly vacation leave for rest and recreation. Can be used for personal time off, holidays, and family time.',
                'is_active' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 30,
                'min_notice_days' => 7,
                'carry_forward' => true,
            ],
            [
                'name' => 'Sick Leave',
                'quota' => 10,
                'description' => 'Medical leave for illness, medical appointments, or recovery. May require medical certificate for extended periods.',
                'is_active' => true,
                'requires_approval' => false,
                'max_consecutive_days' => null,
                'min_notice_days' => 0,
                'carry_forward' => false,
            ],
            [
                'name' => 'Maternity Leave',
                'quota' => 90,
                'description' => 'Leave for new mothers before and after childbirth. Includes prenatal care and postnatal recovery time.',
                'is_active' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 90,
                'min_notice_days' => 30,
                'carry_forward' => false,
            ],
            [
                'name' => 'Paternity Leave',
                'quota' => 14,
                'description' => 'Leave for new fathers to bond with their newborn and support their partner during the postnatal period.',
                'is_active' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 14,
                'min_notice_days' => 14,
                'carry_forward' => false,
            ],
            [
                'name' => 'Emergency Leave',
                'quota' => 5,
                'description' => 'Urgent leave for family emergencies, bereavement, or unexpected critical situations.',
                'is_active' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 5,
                'min_notice_days' => 0,
                'carry_forward' => false,
            ],
            [
                'name' => 'Study Leave',
                'quota' => 10,
                'description' => 'Educational leave for professional development, training, conferences, or continuing education.',
                'is_active' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 10,
                'min_notice_days' => 21,
                'carry_forward' => true,
            ],
            [
                'name' => 'Compensatory Leave',
                'quota' => 15,
                'description' => 'Time off in lieu of overtime work or weekend/holiday work. Earned through extra hours worked.',
                'is_active' => true,
                'requires_approval' => true,
                'max_consecutive_days' => 5,
                'min_notice_days' => 3,
                'carry_forward' => false,
            ],
        ];

        foreach ($leaveTypes as $leaveTypeData) {
            LeaveType::firstOrCreate(
                ['name' => $leaveTypeData['name']],
                $leaveTypeData
            );
        }
    }
}