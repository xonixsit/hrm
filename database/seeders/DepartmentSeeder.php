<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Engineering',
                'code' => 'ENG',
                'description' => 'Software development and technical operations',
                'status' => 'Active'
            ],
            [
                'name' => 'Payment',
                'code' => 'PMT',
                'description' => 'Payment processing and financial transactions',
                'status' => 'Active'
            ],
            [
                'name' => 'Exisiting',
                'code' => 'EXT',
                'description' => 'Existing Client Operations',
                'status' => 'Active'
            ],
            [
                'name' => 'Billing',
                'code' => 'BLG',
                'description' => 'Billing Operations',
                'status' => 'Active'
            ],
            [
                'name' => 'Marketing',
                'code' => 'MKT',
                'description' => 'Marketing and brand management',
                'status' => 'Active'
            ],
            [
                'name' => 'Sales',
                'code' => 'SAL',
                'description' => 'Sales and business development',
                'status' => 'Active'
            ],
            [
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Human resources and talent management',
                'status' => 'Active'
            ],
            [
                'name' => 'Finance',
                'code' => 'FIN',
                'description' => 'Financial planning and accounting',
                'status' => 'Active'
            ],
            [
                'name' => 'Operations',
                'code' => 'OPS',
                'description' => 'Operations and logistics management',
                'status' => 'Active'
            ],
            [
                'name' => 'Customer Support',
                'code' => 'SUP',
                'description' => 'Customer service and technical support',
                'status' => 'Active'
            ],
            [
                'name' => 'Management',
                'code' => 'MGT',
                'description' => 'Executive and senior management',
                'status' => 'Active'
            ]
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['name' => $department['name']], // Check by name
                $department // Create with all data if not exists
            );
        }
    }
}