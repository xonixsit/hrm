<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;

class DefaultProjectSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create a default project for attendance-based timesheet entries
        Project::firstOrCreate(
            ['name' => 'Tax Preparation & Filing Services'],
            [
                'description' => 'Default project for tax preparation, filing services, client consultations, and general tax-related work activities',
                'client' => 'Internal Operations',
                'status' => 'active',
                'is_default' => true,
                'priority' => 'high',
                'progress' => 0
            ]
        );

        // Also create some additional relevant projects for a tax services company
        $additionalProjects = [
            [
                'name' => 'Individual Tax Returns',
                'description' => 'Preparation and filing of individual tax returns (1040, state returns, etc.)',
                'client' => 'Individual Clients',
                'status' => 'active',
                'priority' => 'high',
                'progress' => 0
            ],
            [
                'name' => 'Business Tax Returns',
                'description' => 'Corporate tax returns, partnership returns, S-Corp elections, and business tax planning',
                'client' => 'Business Clients',
                'status' => 'active',
                'priority' => 'high',
                'progress' => 0
            ],
            [
                'name' => 'Tax Planning & Consultation',
                'description' => 'Tax planning meetings, consultation services, and advisory work',
                'client' => 'All Clients',
                'status' => 'active',
                'priority' => 'medium',
                'progress' => 0
            ],
            [
                'name' => 'Bookkeeping & Accounting',
                'description' => 'Monthly bookkeeping, QuickBooks setup, financial statement preparation',
                'client' => 'Business Clients',
                'status' => 'active',
                'priority' => 'medium',
                'progress' => 0
            ],
            [
                'name' => 'IRS Representation & Audit Support',
                'description' => 'IRS correspondence, audit representation, and tax resolution services',
                'client' => 'All Clients',
                'status' => 'active',
                'priority' => 'high',
                'progress' => 0
            ]
        ];

        foreach ($additionalProjects as $projectData) {
            Project::firstOrCreate(
                ['name' => $projectData['name']],
                $projectData
            );
        }

        // Ensure only "Tax Preparation & Filing Services" is marked as default
        Project::where('name', '!=', 'Tax Preparation & Filing Services')
            ->where('is_default', true)
            ->update(['is_default' => false]);
    }
}