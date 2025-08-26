<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Use raw SQL to avoid schema builder issues
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        // Drop the existing notifications table if it exists
        if (Schema::hasTable('notifications')) {
            Schema::drop('notifications');
        }
        
        // Create the new notifications table with the correct structure
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
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the table if rolling back
        Schema::dropIfExists('notifications');
    }
};
