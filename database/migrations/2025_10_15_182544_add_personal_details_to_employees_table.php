<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to avoid MySQL version compatibility issues
        DB::statement("
            ALTER TABLE employees 
            ADD COLUMN date_of_birth DATE NULL AFTER phone,
            ADD COLUMN gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL AFTER date_of_birth,
            ADD COLUMN marital_status ENUM('single', 'married', 'divorced', 'widowed', 'separated') NULL AFTER gender,
            ADD COLUMN nationality VARCHAR(191) NULL AFTER marital_status,
            ADD COLUMN national_id VARCHAR(191) NULL AFTER nationality,
            ADD COLUMN passport_number VARCHAR(191) NULL AFTER national_id,
            ADD COLUMN personal_email VARCHAR(191) NULL AFTER passport_number,
            ADD COLUMN alternate_phone VARCHAR(191) NULL AFTER personal_email,
            ADD COLUMN permanent_address TEXT NULL AFTER alternate_phone,
            ADD COLUMN current_address TEXT NULL AFTER permanent_address,
            ADD COLUMN emergency_contact_name VARCHAR(191) NULL AFTER current_address,
            ADD COLUMN emergency_contact_relationship VARCHAR(191) NULL AFTER emergency_contact_name,
            ADD COLUMN emergency_contact_phone VARCHAR(191) NULL AFTER emergency_contact_relationship,
            ADD COLUMN emergency_contact_email VARCHAR(191) NULL AFTER emergency_contact_phone,
            ADD COLUMN salary DECIMAL(10,2) NULL AFTER emergency_contact_email,
            ADD COLUMN salary_currency VARCHAR(3) DEFAULT 'USD' AFTER salary,
            ADD COLUMN employment_type ENUM('full_time', 'part_time', 'contract', 'intern', 'consultant') DEFAULT 'full_time' AFTER salary_currency,
            ADD COLUMN work_location VARCHAR(191) NULL AFTER employment_type,
            ADD COLUMN work_start_time TIME NULL AFTER work_location,
            ADD COLUMN work_end_time TIME NULL AFTER work_start_time,
            ADD COLUMN bank_name VARCHAR(191) NULL AFTER work_end_time,
            ADD COLUMN bank_account_number VARCHAR(191) NULL AFTER bank_name,
            ADD COLUMN bank_routing_number VARCHAR(191) NULL AFTER bank_account_number,
            ADD COLUMN skills TEXT NULL AFTER bank_routing_number,
            ADD COLUMN certifications TEXT NULL AFTER skills,
            ADD COLUMN education TEXT NULL AFTER certifications,
            ADD COLUMN notes TEXT NULL AFTER education
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'gender',
                'marital_status',
                'nationality',
                'national_id',
                'passport_number',
                'personal_email',
                'alternate_phone',
                'permanent_address',
                'current_address',
                'emergency_contact_name',
                'emergency_contact_relationship',
                'emergency_contact_phone',
                'emergency_contact_email',
                'salary',
                'salary_currency',
                'employment_type',
                'work_location',
                'work_start_time',
                'work_end_time',
                'bank_name',
                'bank_account_number',
                'bank_routing_number',
                'skills',
                'certifications',
                'education',
                'notes'
            ]);
        });
    }
};