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
        $projects = [
            [
                'name' => 'Employee Management System Upgrade',
                'description' => 'Upgrading the current employee management system with new features and improved UI',
                'status' => 'active',
                'start_date' => now()->subDays(30),
                'end_date' => now()->addDays(60),
                'created_at' => now()->subDays(30),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mobile App Development',
                'description' => 'Developing a mobile application for employee self-service',
                'status' => 'active',
                'start_date' => now()->subDays(15),
                'end_date' => now()->addDays(90),
                'created_at' => now()->subDays(15),
                'updated_at' => now(),
            ],
            [
                'name' => 'Data Migration Project',
                'description' => 'Migrating legacy data to the new system',
                'status' => 'active',
                'start_date' => now()->subDays(45),
                'end_date' => now()->addDays(30),
                'created_at' => now()->subDays(45),
                'updated_at' => now(),
            ],
            [
                'name' => 'Security Audit Implementation',
                'description' => 'Implementing security recommendations from the recent audit',
                'status' => 'active',
                'start_date' => now()->subDays(10),
                'end_date' => now()->addDays(45),
                'created_at' => now()->subDays(10),
                'updated_at' => now(),
            ],
            [
                'name' => 'Performance Optimization',
                'description' => 'Optimizing system performance and database queries',
                'status' => 'active',
                'start_date' => now()->subDays(20),
                'end_date' => now()->addDays(40),
                'created_at' => now()->subDays(20),
                'updated_at' => now(),
            ],
            [
                'name' => 'Legacy System Decommission',
                'description' => 'Decommissioning the old legacy system after successful migration',
                'status' => 'completed',
                'start_date' => now()->subDays(90),
                'end_date' => now()->subDays(10),
                'created_at' => now()->subDays(90),
                'updated_at' => now()->subDays(10),
            ],
            [
                'name' => 'Training Platform Development',
                'description' => 'Building an internal training platform for employees',
                'status' => 'on_hold',
                'start_date' => now()->subDays(60),
                'end_date' => null,
                'created_at' => now()->subDays(60),
                'updated_at' => now()->subDays(30),
            ],
        ];

        foreach ($projects as $project) {
            \App\Models\Project::create($project);
        }
    }
}
