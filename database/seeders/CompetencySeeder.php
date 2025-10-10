<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Competency;
use App\Models\Department;

class CompetencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $competencies = [
            [
                'name' => 'Communication Skills',
                'description' => 'Ability to communicate effectively with colleagues, clients, and stakeholders',
                'category' => 'Soft Skills',
                'weight' => 1.00,
                'role_specific' => false,
                'is_active' => true
            ],
            [
                'name' => 'Technical Skills',
                'description' => 'Proficiency in job-specific technical knowledge and tools',
                'category' => 'Technical',
                'weight' => 1.20,
                'role_specific' => true,
                'is_active' => true
            ],
            [
                'name' => 'Leadership',
                'description' => 'Ability to guide, motivate, and influence others',
                'category' => 'Leadership',
                'weight' => 1.10,
                'role_specific' => true,
                'is_active' => true
            ],
            [
                'name' => 'Teamwork & Collaboration',
                'description' => 'Ability to work effectively with others in a team environment',
                'category' => 'Soft Skills',
                'weight' => 0.90,
                'role_specific' => false,
                'is_active' => true
            ],
            [
                'name' => 'Problem Solving',
                'description' => 'Ability to identify, analyze, and solve problems effectively',
                'category' => 'Analytical',
                'weight' => 1.00,
                'role_specific' => false,
                'is_active' => true
            ],
            [
                'name' => 'Time Management',
                'description' => 'Ability to manage time effectively and meet deadlines',
                'category' => 'Organizational',
                'weight' => 0.80,
                'role_specific' => false,
                'is_active' => true
            ],
            [
                'name' => 'Customer Service',
                'description' => 'Ability to provide excellent service to internal and external customers',
                'category' => 'Customer Focus',
                'weight' => 1.10,
                'role_specific' => true,
                'is_active' => true
            ],
            [
                'name' => 'Adaptability',
                'description' => 'Ability to adapt to change and work effectively in different situations',
                'category' => 'Soft Skills',
                'weight' => 0.90,
                'role_specific' => false,
                'is_active' => true
            ]
        ];

        foreach ($competencies as $competencyData) {
            Competency::create($competencyData);
        }
    }
}