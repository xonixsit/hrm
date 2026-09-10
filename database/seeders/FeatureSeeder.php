<?php

namespace Database\Seeders;

use App\Models\Feature;
use App\Models\FeatureRolePermission;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    /**
     * Each entry: key, label, group, sort_order
     * default_roles: roles that get access on first seed (Admin always bypasses).
     */
    private array $features = [
        // ── Main nav ──────────────────────────────────────────────────────────
        ['key' => 'dashboard',        'label' => 'Dashboard',            'group' => 'General',    'sort' => 1,  'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'time_tracking',    'label' => 'Time Tracking',        'group' => 'General',    'sort' => 2,  'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'leave',            'label' => 'Leave Applications',   'group' => 'General',    'sort' => 3,  'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'training',         'label' => 'Training',             'group' => 'General',    'sort' => 4,  'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'messaging',        'label' => 'Messages',             'group' => 'General',    'sort' => 5,  'default_roles' => ['HR', 'Manager', 'Employee']],

        // ── Assessments ───────────────────────────────────────────────────────
        ['key' => 'my_assessments',       'label' => 'My Assessments',       'group' => 'Assessments', 'sort' => 10, 'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'all_assessments',      'label' => 'All Assessments',      'group' => 'Assessments', 'sort' => 11, 'default_roles' => ['HR', 'Manager']],
        ['key' => 'assessment_dashboard', 'label' => 'Assessment Dashboard', 'group' => 'Assessments', 'sort' => 12, 'default_roles' => ['HR', 'Manager']],
        ['key' => 'pending_assessments',  'label' => 'Pending Assessments',  'group' => 'Assessments', 'sort' => 13, 'default_roles' => ['HR', 'Manager']],
        ['key' => 'assessment_cycles',    'label' => 'Assessment Cycles',    'group' => 'Assessments', 'sort' => 14, 'default_roles' => []],
        ['key' => 'competency_setup',     'label' => 'Competency Setup',     'group' => 'Assessments', 'sort' => 15, 'default_roles' => []],
        ['key' => 'competency_reports',   'label' => 'Competency Reports',   'group' => 'Assessments', 'sort' => 16, 'default_roles' => ['Manager']],

        // ── More / Management ─────────────────────────────────────────────────
        ['key' => 'work_reports',         'label' => 'Work Reports',         'group' => 'Management', 'sort' => 20, 'default_roles' => ['HR', 'Manager']],
        ['key' => 'employees',            'label' => 'Employee Management',  'group' => 'Management', 'sort' => 21, 'default_roles' => ['HR', 'Manager']],
        ['key' => 'leave_policies',       'label' => 'Leave Policies',       'group' => 'Management', 'sort' => 22, 'default_roles' => ['HR']],
        ['key' => 'departments',          'label' => 'Departments',          'group' => 'Management', 'sort' => 23, 'default_roles' => ['HR']],
        ['key' => 'analytics',            'label' => 'Organizational Analytics', 'group' => 'Management', 'sort' => 24, 'default_roles' => ['Manager']],
        ['key' => 'timesheets',           'label' => 'Timesheet Approvals',  'group' => 'Management', 'sort' => 25, 'default_roles' => ['HR', 'Manager']],
        ['key' => 'reports',              'label' => 'View Reports',         'group' => 'Management', 'sort' => 26, 'default_roles' => ['HR', 'Manager']],

        // ── General / Self-service ─────────────────────────────────────────────
        ['key' => 'skill_tests',      'label' => 'My Skill Tests',       'group' => 'General',    'sort' => 30, 'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'ideas',            'label' => 'Share Ideas',          'group' => 'General',    'sort' => 31, 'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'feedback',         'label' => 'Feedback',             'group' => 'General',    'sort' => 32, 'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'employee_handbook','label' => 'Employee Handbook',    'group' => 'General',    'sort' => 33, 'default_roles' => ['HR', 'Manager', 'Employee']],
        ['key' => 'support',          'label' => 'Support',              'group' => 'General',    'sort' => 34, 'default_roles' => ['HR', 'Manager', 'Employee']],

        // ── Admin section items (Admin always bypasses, but other roles can be granted) ──
        ['key' => 'whistleblower_reports', 'label' => 'Whistleblower Reports', 'group' => 'Admin', 'sort' => 40, 'default_roles' => []],
        ['key' => 'skill_tests_admin',     'label' => 'Skill Tests (Admin)',   'group' => 'Admin', 'sort' => 41, 'default_roles' => ['HR']],
        ['key' => 'skill_tests_reviews',   'label' => 'Test Reviews',          'group' => 'Admin', 'sort' => 42, 'default_roles' => ['HR']],
        ['key' => 'message_center',        'label' => 'Message Center',        'group' => 'Admin', 'sort' => 43, 'default_roles' => []],
        ['key' => 'role_management',       'label' => 'Role Management',       'group' => 'Admin', 'sort' => 44, 'default_roles' => []],
        ['key' => 'system_settings',       'label' => 'System Settings',       'group' => 'Admin', 'sort' => 45, 'default_roles' => []],
        ['key' => 'feature_permissions',   'label' => 'Feature Permissions',   'group' => 'Admin', 'sort' => 46, 'default_roles' => []],
    ];

    public function run(): void
    {
        foreach ($this->features as $data) {
            $feature = Feature::firstOrCreate(
                ['key' => $data['key']],
                [
                    'label'      => $data['label'],
                    'group'      => $data['group'],
                    'sort_order' => $data['sort'],
                ]
            );

            // Seed default role access (only on first run — don't overwrite admin customisations)
            foreach ($data['default_roles'] as $role) {
                FeatureRolePermission::firstOrCreate([
                    'feature_id' => $feature->id,
                    'role_name'  => $role,
                ]);
            }
        }
    }
}
