<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class CompetencyPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create competency-related permissions
        $permissions = [
            // Competency Framework Management
            'view competencies',
            'create competencies',
            'update competencies',
            'delete competencies',
            'manage competency framework',
            
            // Competency Assessment Permissions
            'view competency assessments',
            'create competency assessments',
            'update competency assessments',
            'delete competency assessments',
            'approve competency assessments',
            'reject competency assessments',
            
            // Assessment Type Specific Permissions
            'create self assessments',
            'create manager assessments',
            'create peer assessments',
            'create 360 assessments',
            
            // Assessment Cycle Management
            'view assessment cycles',
            'create assessment cycles',
            'update assessment cycles',
            'delete assessment cycles',
            'manage assessment cycles',
            
            // Analytics and Reporting
            'view competency analytics',
            'view department analytics',
            'export competency data',
            'generate competency reports',
            
            // Development Planning
            'view development plans',
            'create development plans',
            'update development plans',
            'delete development plans',
            
            // Employee Competency Management
            'view employee competencies',
            'assess employee competencies',
            'manage employee competency framework',
            
            // Department Competency Management
            'view department competency framework',
            'manage department competency framework',
            'conduct department assessments',
            'assign role competencies',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to roles
        $adminRole = Role::findByName('Admin');
        $hrRole = Role::findByName('HR');
        $managerRole = Role::findByName('Manager');
        $employeeRole = Role::findByName('Employee');

        // Admin gets all permissions
        $adminRole->givePermissionTo($permissions);

        // HR gets most permissions except some admin-only ones
        $hrPermissions = [
            'view competencies',
            'create competencies',
            'update competencies',
            'delete competencies',
            'manage competency framework',
            'view competency assessments',
            'create competency assessments',
            'update competency assessments',
            'approve competency assessments',
            'reject competency assessments',
            'create manager assessments',
            'create 360 assessments',
            'view assessment cycles',
            'create assessment cycles',
            'update assessment cycles',
            'manage assessment cycles',
            'view competency analytics',
            'view department analytics',
            'export competency data',
            'generate competency reports',
            'view development plans',
            'create development plans',
            'update development plans',
            'view employee competencies',
            'assess employee competencies',
            'manage employee competency framework',
            'view department competency framework',
            'manage department competency framework',
            'conduct department assessments',
            'assign role competencies',
        ];
        $hrRole->givePermissionTo($hrPermissions);

        // Manager gets department-specific permissions
        $managerPermissions = [
            'view competencies',
            'view competency assessments',
            'create competency assessments',
            'update competency assessments',
            'approve competency assessments',
            'reject competency assessments',
            'create manager assessments',
            'create peer assessments',
            'view assessment cycles',
            'create assessment cycles',
            'view competency analytics',
            'view department analytics',
            'view development plans',
            'create development plans',
            'update development plans',
            'view employee competencies',
            'assess employee competencies',
            'view department competency framework',
            'manage department competency framework',
            'conduct department assessments',
            'assign role competencies',
        ];
        $managerRole->givePermissionTo($managerPermissions);

        // Employee gets basic permissions
        $employeePermissions = [
            'view competencies',
            'view competency assessments',
            'create self assessments',
            'create peer assessments',
            'view development plans',
            'create development plans',
            'update development plans',
            'view employee competencies',
            'view department competency framework',
        ];
        $employeeRole->givePermissionTo($employeePermissions);
    }
}