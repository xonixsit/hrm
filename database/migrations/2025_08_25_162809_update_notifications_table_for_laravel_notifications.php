<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Drop the old user_id foreign key constraint first
            $table->dropForeign(['user_id']);
            
            // Rename user_id to notifiable_id and change its type
            $table->renameColumn('user_id', 'notifiable_id');
            
            // Add the required Laravel notification columns
            $table->string('type')->after('id');
            $table->string('notifiable_type')->after('notifiable_id');
            $table->json('data')->after('notifiable_type');
            
            // Drop the old message column as we'll use the data column instead
            $table->dropColumn('message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Reverse the changes
            $table->dropColumn(['type', 'notifiable_type', 'data']);
            $table->text('message')->after('notifiable_id');
            $table->renameColumn('notifiable_id', 'user_id');
            
            // Re-add the foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};