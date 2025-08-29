<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some employees to assign as managers and team members
        $employees = \App\Models\Employee::with('user')->get();
        $managers = $employees->filter(function ($employee) {
            return $employee->user->hasAnyRole(['Admin', 'Manager']);
        });

        $projects = [
            [
                'name' => 'Employee Management System Upgrade',
                'description' => 'Upgrading the current employee management system with new features and improved UI',
                'client' => 'Internal - HR Department',
                'status' => 'active',
                'priority' => 'high',
                'budget' => 75000.00,
                'progress' => 65,
                'start_date' => now()->subDays(30),
                'due_date' => now()->addDays(60),
                'manager_id' => $managers->random()->id ?? null,
            ],
            [
                'name' => 'Mobile App Development',
                'description' => 'Developing a mobile application for employee self-service',
                'client' => 'Internal - IT Department',
                'status' => 'active',
                'priority' => 'medium',
                'budget' => 120000.00,
                'progress' => 35,
                'start_date' => now()->subDays(15),
                'due_date' => now()->addDays(90),
                'manager_id' => $managers->random()->id ?? null,
            ],
            [
                'name' => 'Data Migration Project',
                'description' => 'Migrating legacy data to the new system',
                'client' => 'Internal - Operations',
                'status' => 'active',
                'priority' => 'urgent',
                'budget' => 45000.00,
                'progress' => 80,
                'start_date' => now()->subDays(45),
                'due_date' => now()->addDays(30),
                'manager_id' => $managers->random()->id ?? null,
            ],
            [
                'name' => 'Security Audit Implementation',
                'description' => 'Implementing security recommendations from the recent audit',
                'client' => 'External - SecureIT Consulting',
                'status' => 'active',
                'priority' => 'high',
                'budget' => 85000.00,
                'progress' => 25,
                'start_date' => now()->subDays(10),
                'due_date' => now()->addDays(45),
                'manager_id' => $managers->random()->id ?? null,
            ],
            [
                'name' => 'Performance Optimization',
                'description' => 'Optimizing system performance and database queries',
                'client' => 'Internal - Engineering',
                'status' => 'active',
                'priority' => 'medium',
                'budget' => 35000.00,
                'progress' => 50,
                'start_date' => now()->subDays(20),
                'due_date' => now()->addDays(40),
                'manager_id' => $managers->random()->id ?? null,
            ],
            [
                'name' => 'Legacy System Decommission',
                'description' => 'Decommissioning the old legacy system after successful migration',
                'client' => 'Internal - IT Operations',
                'status' => 'completed',
                'priority' => 'low',
                'budget' => 15000.00,
                'progress' => 100,
                'start_date' => now()->subDays(90),
                'due_date' => now()->subDays(10),
                'manager_id' => $managers->random()->id ?? null,
            ],
            [
                'name' => 'Training Platform Development',
                'description' => 'Building an internal training platform for employees',
                'client' => 'Internal - Learning & Development',
                'status' => 'on_hold',
                'priority' => 'low',
                'budget' => 95000.00,
                'progress' => 15,
                'start_date' => now()->subDays(60),
                'due_date' => now()->addDays(120),
                'manager_id' => $managers->random()->id ?? null,
            ],
        ];

        foreach ($projects as $projectData) {
            $project = \App\Models\Project::create($projectData);
            
            // Assign random team members (2-5 members per project)
            if ($employees->count() > 0) {
                $teamSize = rand(2, min(5, $employees->count()));
                $teamMembers = $employees->random($teamSize)->pluck('id')->toArray();
                $project->teamMembers()->attach($teamMembers);
            }
        }

        // Create additional projects using factory
        if ($employees->count() > 0) {
            \App\Models\Project::factory(10)
                ->create()
                ->each(function ($project) use ($employees, $managers) {
                    // Assign manager
                    if ($managers->count() > 0) {
                        $project->update(['manager_id' => $managers->random()->id]);
                    }
                    
                    // Assign team members
                    $teamSize = rand(1, min(6, $employees->count()));
                    $teamMembers = $employees->random($teamSize)->pluck('id')->toArray();
                    $project->teamMembers()->attach($teamMembers);
                });
        }
    }
}
