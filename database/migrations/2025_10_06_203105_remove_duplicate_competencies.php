<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Competency;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove duplicate competencies, keeping the first occurrence of each name
        $competencies = Competency::all();
        $seen = [];
        $duplicatesRemoved = 0;

        foreach ($competencies as $competency) {
            if (in_array($competency->name, $seen)) {
                // This is a duplicate, delete it
                $competency->delete();
                $duplicatesRemoved++;
                echo "Removed duplicate competency: {$competency->name} (ID: {$competency->id})\n";
            } else {
                // First occurrence, keep it
                $seen[] = $competency->name;
            }
        }

        echo "Removed {$duplicatesRemoved} duplicate competencies.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reverse this migration as we've deleted data
        // You would need to re-run the competency seeder if needed
    }
};