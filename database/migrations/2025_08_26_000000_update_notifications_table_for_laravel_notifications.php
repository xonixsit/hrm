<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to avoid schema builder issues
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        // Check if the table exists and has the columns we want to modify
        if (Schema::hasTable('notifications')) {
            // Drop the table and recreate it with the new structure
            Schema::drop('notifications');
            
            DB::statement("
                CREATE TABLE `notifications` (
                    `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                    `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                    `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                    `notifiable_id` bigint UNSIGNED NOT NULL,
                    `data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
                    `read_at` timestamp NULL DEFAULT NULL,
                    `created_at` timestamp NULL DEFAULT NULL,
                    `updated_at` timestamp NULL DEFAULT NULL,
                    PRIMARY KEY (`id`),
                    KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a one-way migration, but we'll provide a way to rollback
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('notifications');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};