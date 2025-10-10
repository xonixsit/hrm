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
        // Use raw SQL to check and add columns to avoid MySQL version issues
        $columns = $this->getTableColumns('competencies');
        
        Schema::table('competencies', function (Blueprint $table) use ($columns) {
            if (!in_array('category', $columns)) {
                $table->string('category')->after('description')->default('General');
            }
            if (!in_array('weight', $columns)) {
                $table->decimal('weight', 3, 2)->default(1.00)->after('category');
            }
            if (!in_array('measurement_indicators', $columns)) {
                $table->text('measurement_indicators')->nullable()->after('weight');
            }
            if (!in_array('rating_guidelines', $columns)) {
                $table->text('rating_guidelines')->nullable()->after('measurement_indicators');
            }
            if (!in_array('department_id', $columns)) {
                $table->foreignId('department_id')->nullable()->after('rating_guidelines')->constrained()->onDelete('set null');
            }
            if (!in_array('role_specific', $columns)) {
                $table->boolean('role_specific')->default(false)->after('department_id');
            }
            if (!in_array('is_active', $columns)) {
                $table->boolean('is_active')->default(true)->after('role_specific');
            }
            if (!in_array('created_by', $columns)) {
                $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->onDelete('set null');
            }
            if (!in_array('updated_by', $columns)) {
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            }
        });

        // Add indexes
        $indexes = $this->getTableIndexes('competencies');
        Schema::table('competencies', function (Blueprint $table) use ($indexes, $columns) {
            if (in_array('category', $columns) && !in_array('competencies_category_index', $indexes)) {
                $table->index('category');
            }
            if (in_array('department_id', $columns) && !in_array('competencies_department_id_index', $indexes)) {
                $table->index('department_id');
            }
            if (in_array('is_active', $columns) && !in_array('competencies_is_active_index', $indexes)) {
                $table->index('is_active');
            }
            if (in_array('role_specific', $columns) && !in_array('competencies_role_specific_index', $indexes)) {
                $table->index('role_specific');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = $this->getTableColumns('competencies');
        $indexes = $this->getTableIndexes('competencies');
        
        Schema::table('competencies', function (Blueprint $table) use ($columns, $indexes) {
            // Drop indexes first
            if (in_array('competencies_category_index', $indexes)) {
                $table->dropIndex(['category']);
            }
            if (in_array('competencies_department_id_index', $indexes)) {
                $table->dropIndex(['department_id']);
            }
            if (in_array('competencies_is_active_index', $indexes)) {
                $table->dropIndex(['is_active']);
            }
            if (in_array('competencies_role_specific_index', $indexes)) {
                $table->dropIndex(['role_specific']);
            }
            
            // Drop foreign keys
            if (in_array('department_id', $columns)) {
                $table->dropForeign(['department_id']);
            }
            if (in_array('created_by', $columns)) {
                $table->dropForeign(['created_by']);
            }
            if (in_array('updated_by', $columns)) {
                $table->dropForeign(['updated_by']);
            }
            
            // Drop columns
            $columnsToCheck = [
                'category', 'weight', 'measurement_indicators', 'rating_guidelines',
                'department_id', 'role_specific', 'is_active', 'created_by', 'updated_by'
            ];
            
            foreach ($columnsToCheck as $column) {
                if (in_array($column, $columns)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    /**
     * Get table columns using raw SQL.
     */
    private function getTableColumns(string $table): array
    {
        try {
            $columns = DB::select("SHOW COLUMNS FROM {$table}");
            return array_map(function ($column) {
                return $column->Field;
            }, $columns);
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get table indexes using raw SQL.
     */
    private function getTableIndexes(string $table): array
    {
        try {
            $indexes = DB::select("SHOW INDEX FROM {$table}");
            return array_map(function ($index) {
                return $index->Key_name;
            }, $indexes);
        } catch (Exception $e) {
            return [];
        }
    }
};