<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Project;
use App\Models\LeaveType;
use App\Models\Leave;
use App\Models\Attendance;
use App\Models\Timesheet;
use App\Models\WorkReport;
use App\Models\Competency;
use App\Models\CompetencyAssessment;
use App\Models\AssessmentCycle;
use App\Models\Feedback;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run()
    {
        // Publish and run Spatie permission migrations if needed
        $this->ensureSpatieTablesExist();
        
        // Clear existing data
        $this->clearExistingData();
        
        // Create roles and permissions
        $this->createRolesAndPermissions();
        
        // Create departments
        $departments = $this->createDepartments();
        
        // Create projects
        $projects = $this->createProjects();
        
        // Create leave types
        $leaveTypes = $this->createLeaveTypes();
        
        // Create competencies
        $competencies = $this->createCompetencies();
        
        // Create assessment cycles
        $assessmentCycles = $this->createAssessmentCycles();
        
        // Create users and employees
        $users = $this->createUsersAndEmployees($departments);
        
        // Create sample data
        $this->createLeaves($users, $leaveTypes);
        $this->createAttendances($users);
        $this->createTimesheets($users, $projects);
        $this->createWorkReports($users);
        $this->createCompetencyAssessments($users, $competencies, $assessmentCycles);
        $this->createFeedbacks($users);
        
        $this->command->info('Demo data seeded successfully!');
    }
    
    private function ensureSpatieTablesExist()
    {
        // Check if roles table exists, if not publish and run migrations
        if (!DB::getSchemaBuilder()->hasTable('roles')) {
            $this->command->info('Publishing Spatie permission migrations...');
            \Artisan::call('vendor:publish', [
                '--provider' => 'Spatie\Permission\PermissionServiceProvider',
                '--tag' => 'migrations'
            ]);
            
            $this->command->info('Running Spatie permission migrations...');
            \Artisan::call('migrate', ['--path' => 'database/migrations', '--force' => true]);
        }
    }
    
    private function clearExistingData()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear all tables
        $tables = [
            'feedbacks', 'competency_assessments', 'work_reports', 'timesheets', 
            'attendances', 'leaves', 'employees', 'users', 'departments', 
            'projects', 'leave_types', 'competencies', 'assessment_cycles',
            'model_has_roles', 'model_has_permissions', 'role_has_permissions'
        ];
        
        foreach ($tables as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                DB::table($table)->truncate();
            }
        }
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
    
    private function createRolesAndPermissions()
    {
        // Create roles
        $adminRole = Role::create(['name' => 'Admin']);
        $hrRole = Role::create(['name' => 'HR']);
        $managerRole = Role::create(['name' => 'Manager']);
        $employeeRole = Role::create(['name' => 'Employee']);
        
        // Create permissions (you can expand this based on your needs)
        $permissions = [
            'manage users', 'manage employees', 'manage departments',
            'manage leaves', 'approve leaves', 'manage timesheets',
            'manage assessments', 'view reports', 'manage projects'
        ];
        
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
        
        // Assign permissions to roles
        $adminRole->givePermissionTo(Permission::all());
        $hrRole->givePermissionTo(['manage employees', 'manage leaves', 'approve leaves', 'view reports']);
        $managerRole->givePermissionTo(['approve leaves', 'manage timesheets', 'manage assessments']);
    }
    
    private function createDepartments()
    {
        return [
            Department::create([
                'name' => 'Human Resources',
                'description' => 'Manages employee relations and policies',
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Department::create([
                'name' => 'Information Technology',
                'description' => 'Handles all technology and software development',
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Department::create([
                'name' => 'Sales & Marketing',
                'description' => 'Drives business growth and customer acquisition',
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Department::create([
                'name' => 'Finance & Accounting',
                'description' => 'Manages financial operations and reporting',
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Department::create([
                'name' => 'Operations',
                'description' => 'Oversees daily business operations',
                'created_at' => now(),
                'updated_at' => now()
            ])
        ];
    }
    
    private function createProjects()
    {
        return [
            Project::create([
                'name' => 'Website Redesign',
                'description' => 'Complete overhaul of company website',
                'client' => 'Internal',
                'priority' => 'high',
                'status' => 'active',
                'is_default' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Project::create([
                'name' => 'Mobile App Development',
                'description' => 'New mobile application for customers',
                'client' => 'TechCorp Inc.',
                'priority' => 'high',
                'status' => 'active',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Project::create([
                'name' => 'CRM Integration',
                'description' => 'Integrate new CRM system',
                'client' => 'SalesCorp Ltd.',
                'priority' => 'medium',
                'status' => 'active',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Project::create([
                'name' => 'Data Analytics Platform',
                'description' => 'Build comprehensive analytics dashboard',
                'client' => 'DataTech Solutions',
                'priority' => 'medium',
                'status' => 'planning',
                'is_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ])
        ];
    }
    
    private function createLeaveTypes()
    {
        return [
            LeaveType::create([
                'name' => 'Annual Leave',
                'quota' => 25,
                'description' => 'Yearly vacation days',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            LeaveType::create([
                'name' => 'Sick Leave',
                'quota' => 10,
                'description' => 'Medical leave days',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            LeaveType::create([
                'name' => 'Personal Leave',
                'quota' => 5,
                'description' => 'Personal time off',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            LeaveType::create([
                'name' => 'Maternity Leave',
                'quota' => 90,
                'description' => 'Maternity leave days',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ])
        ];
    }
    
    private function createCompetencies()
    {
        return [
            Competency::create([
                'name' => 'Communication Skills',
                'category' => 'Soft Skills',
                'description' => 'Ability to communicate effectively',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Competency::create([
                'name' => 'Leadership',
                'category' => 'Management',
                'description' => 'Leading and motivating teams',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Competency::create([
                'name' => 'Technical Expertise',
                'category' => 'Technical',
                'description' => 'Job-specific technical skills',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Competency::create([
                'name' => 'Problem Solving',
                'category' => 'Analytical',
                'description' => 'Analytical and problem-solving abilities',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            Competency::create([
                'name' => 'Customer Service',
                'category' => 'Service',
                'description' => 'Customer interaction and service skills',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ])
        ];
    }
    
    private function createAssessmentCycles()
    {
        return [
            AssessmentCycle::create([
                'name' => 'Q4 2024 Performance Review',
                'description' => 'Quarterly performance assessment',
                'start_date' => now()->subDays(30),
                'end_date' => now()->addDays(30),
                'status' => 'active',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]),
            AssessmentCycle::create([
                'name' => 'Annual Review 2024',
                'description' => 'Annual comprehensive review',
                'start_date' => now()->subDays(60),
                'end_date' => now()->addDays(60),
                'status' => 'active',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ])
        ];
    }
    
    private function createUsersAndEmployees($departments)
    {
        $users = [];
        
        // Create Admin User
        $adminUser = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@xonixs.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $adminUser->assignRole('Admin');
        
        $adminEmployee = Employee::create([
            'user_id' => $adminUser->id,
            'employee_code' => 'ADM001',
            'department_id' => $departments[0]->id,
            'position' => 'System Administrator',
            'join_date' => now()->subYears(2),
            'salary' => 80000,
            'phone' => '+1-555-0001',
            'address' => '123 Admin Street, Tech City',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $users[] = ['user' => $adminUser, 'employee' => $adminEmployee];
        
        // Create HR Manager
        $hrUser = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'hr@xonixs.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $hrUser->assignRole('HR');
        
        $hrEmployee = Employee::create([
            'user_id' => $hrUser->id,
            'employee_code' => 'HR001',
            'department_id' => $departments[0]->id,
            'position' => 'HR Manager',
            'join_date' => now()->subYears(3),
            'salary' => 70000,
            'phone' => '+1-555-0002',
            'address' => '456 HR Avenue, Business District',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $users[] = ['user' => $hrUser, 'employee' => $hrEmployee];
        
        // Create IT Manager
        $itManagerUser = User::create([
            'name' => 'Michael Chen',
            'email' => 'manager@xonixs.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $itManagerUser->assignRole('Manager');
        
        $itManagerEmployee = Employee::create([
            'user_id' => $itManagerUser->id,
            'employee_code' => 'IT001',
            'department_id' => $departments[1]->id,
            'position' => 'IT Manager',
            'join_date' => now()->subYears(4),
            'salary' => 85000,
            'phone' => '+1-555-0003',
            'address' => '789 Tech Boulevard, Innovation Hub',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        $users[] = ['user' => $itManagerUser, 'employee' => $itManagerEmployee];
        
        // Create regular employees
        $employeeData = [
            ['name' => 'John Doe', 'email' => 'employee@xonixs.com', 'code' => 'EMP001', 'dept' => 1, 'position' => 'Software Developer'],
            ['name' => 'Emily Davis', 'email' => 'emily.davis@xonixs.com', 'code' => 'EMP002', 'dept' => 1, 'position' => 'Frontend Developer'],
            ['name' => 'Robert Wilson', 'email' => 'robert.wilson@xonixs.com', 'code' => 'EMP003', 'dept' => 2, 'position' => 'Sales Representative'],
            ['name' => 'Lisa Anderson', 'email' => 'lisa.anderson@xonixs.com', 'code' => 'EMP004', 'dept' => 2, 'position' => 'Marketing Specialist'],
            ['name' => 'David Brown', 'email' => 'david.brown@xonixs.com', 'code' => 'EMP005', 'dept' => 3, 'position' => 'Accountant'],
            ['name' => 'Jennifer Taylor', 'email' => 'jennifer.taylor@xonixs.com', 'code' => 'EMP006', 'dept' => 3, 'position' => 'Financial Analyst'],
            ['name' => 'James Miller', 'email' => 'james.miller@xonixs.com', 'code' => 'EMP007', 'dept' => 4, 'position' => 'Operations Coordinator'],
            ['name' => 'Maria Garcia', 'email' => 'maria.garcia@xonixs.com', 'code' => 'EMP008', 'dept' => 4, 'position' => 'Quality Assurance'],
        ];
        
        foreach ($employeeData as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $user->assignRole('Employee');
            
            $employee = Employee::create([
                'user_id' => $user->id,
                'employee_code' => $data['code'],
                'department_id' => $departments[$data['dept']]->id,
                'position' => $data['position'],
                'join_date' => now()->subMonths(rand(6, 24)),
                'salary' => rand(45000, 75000),
                'phone' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'address' => rand(100, 999) . ' Employee Street, Work City',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            $users[] = ['user' => $user, 'employee' => $employee];
        }
        
        return $users;
    }
    
    private function createLeaves($users, $leaveTypes)
    {
        foreach ($users as $userData) {
            $employee = $userData['employee'];
            
            // Create 2-4 leave requests per employee
            for ($i = 0; $i < rand(2, 4); $i++) {
                $leaveType = $leaveTypes[array_rand($leaveTypes)];
                $startDate = now()->subDays(rand(1, 90));
                $endDate = $startDate->copy()->addDays(rand(1, 5));
                $statuses = ['pending', 'approved', 'rejected'];
                
                Leave::create([
                    'employee_id' => $employee->id,
                    'leave_type_id' => $leaveType->id,
                    'from_date' => $startDate,
                    'to_date' => $endDate,
                    'reason' => 'Sample leave request for ' . $leaveType->name,
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => $startDate->subDays(rand(1, 7)),
                    'updated_at' => now()
                ]);
            }
        }
    }
    
    private function createAttendances($users)
    {
        foreach ($users as $userData) {
            $employee = $userData['employee'];
            
            // Create attendance records for the last 30 days
            for ($i = 0; $i < 30; $i++) {
                $date = now()->subDays($i);
                
                // Skip weekends
                if ($date->isWeekend()) continue;
                
                $clockIn = $date->copy()->setTime(rand(8, 9), rand(0, 59));
                $clockOut = $clockIn->copy()->addHours(rand(7, 9))->addMinutes(rand(0, 59));
                $workMinutes = $clockIn->diffInMinutes($clockOut) - rand(30, 60); // Subtract break time
                
                Attendance::create([
                    'employee_id' => $employee->id,
                    'date' => $date->format('Y-m-d'),
                    'clock_in' => $clockIn,
                    'clock_out' => $clockOut,
                    'work_minutes' => $workMinutes,
                    'total_break_minutes' => rand(30, 60),
                    'status' => 'clocked_out',
                    'on_break' => false,
                    'break_sessions' => [
                        [
                            'start' => $clockIn->copy()->addHours(4)->toISOString(),
                            'end' => $clockIn->copy()->addHours(4)->addMinutes(30)->toISOString(),
                            'duration_minutes' => 30
                        ]
                    ],
                    'created_at' => $clockIn,
                    'updated_at' => $clockOut
                ]);
            }
        }
    }
    
    private function createTimesheets($users, $projects)
    {
        foreach ($users as $userData) {
            $employee = $userData['employee'];
            
            // Create timesheet entries for the last 20 days
            for ($i = 0; $i < 20; $i++) {
                $date = now()->subDays($i);
                
                // Skip weekends
                if ($date->isWeekend()) continue;
                
                $project = $projects[array_rand($projects)];
                $hours = rand(6, 8) + (rand(0, 3) * 0.25); // 6-8 hours in 15-minute increments
                $statuses = ['pending', 'approved', 'rejected'];
                
                Timesheet::create([
                    'employee_id' => $employee->id,
                    'project_id' => $project->id,
                    'date' => $date->format('Y-m-d'),
                    'hours' => $hours,
                    'description' => 'Worked on ' . $project->name . ' - various development tasks',
                    'status' => $statuses[array_rand($statuses)],
                    'created_at' => $date,
                    'updated_at' => now()
                ]);
            }
        }
    }
    
    private function createWorkReports($users)
    {
        foreach ($users as $userData) {
            $employee = $userData['employee'];
            
            // Create work reports for the last 15 days
            for ($i = 0; $i < 15; $i++) {
                $date = now()->subDays($i);
                
                // Skip weekends
                if ($date->isWeekend()) continue;
                
                WorkReport::create([
                    'employee_id' => $employee->id,
                    'date' => $date->format('Y-m-d'),
                    'tasks_completed' => rand(3, 8),
                    'hours_worked' => rand(6, 8) + (rand(0, 3) * 0.25),
                    'successful_calls' => rand(5, 20),
                    'meetings_attended' => rand(1, 4),
                    'issues_resolved' => rand(1, 5),
                    'notes' => 'Daily work report - completed assigned tasks and attended meetings',
                    'created_at' => $date,
                    'updated_at' => $date
                ]);
            }
        }
    }
    
    private function createCompetencyAssessments($users, $competencies, $assessmentCycles)
    {
        foreach ($users as $userData) {
            $employee = $userData['employee'];
            
            // Create 2-3 assessments per employee
            for ($i = 0; $i < rand(2, 3); $i++) {
                $competency = $competencies[array_rand($competencies)];
                $cycle = $assessmentCycles[array_rand($assessmentCycles)];
                $assessmentTypes = ['self', 'manager', 'peer'];
                $statuses = ['draft', 'submitted', 'approved'];
                $status = $statuses[array_rand($statuses)];
                
                CompetencyAssessment::create([
                    'employee_id' => $employee->id,
                    'competency_id' => $competency->id,
                    'assessor_id' => $users[array_rand($users)]['user']->id,
                    'assessment_cycle_id' => $cycle->id,
                    'assessment_type' => $assessmentTypes[array_rand($assessmentTypes)],
                    'status' => $status,
                    'rating' => $status === 'submitted' || $status === 'approved' ? rand(3, 5) : null,
                    'comments' => $status !== 'draft' ? 'Assessment completed for ' . $competency->name : null,
                    'evidence_files' => [],
                    'development_notes' => 'Continue developing skills in this area',
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now()
                ]);
            }
        }
    }
    
    private function createFeedbacks($users)
    {
        foreach ($users as $userData) {
            $user = $userData['user'];
            
            // Create 1-2 feedback entries per user
            for ($i = 0; $i < rand(1, 2); $i++) {
                $reviewer = $users[array_rand($users)]['user'];
                
                // Don't create self-feedback
                if ($reviewer->id === $user->id) continue;
                
                Feedback::create([
                    'reviewer_id' => $reviewer->id,
                    'reviewee_id' => $user->id,
                    'feedback' => 'Great work on recent projects. Shows strong technical skills and good collaboration.',
                    'rating' => rand(3, 5),
                    'created_at' => now()->subDays(rand(1, 60)),
                    'updated_at' => now()
                ]);
            }
        }
    }
}