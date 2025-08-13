<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LeaveType;
use App\Models\Leave;
use Illuminate\Support\Facades\DB;

class CleanupDuplicateLeaveTypes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leave-types:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up duplicate leave types and consolidate them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting leave types cleanup...');
        
        // Get all leave types grouped by name
        $duplicateGroups = LeaveType::select('name', DB::raw('COUNT(*) as count'))
            ->groupBy('name')
            ->having('count', '>', 1)
            ->get();
            
        if ($duplicateGroups->isEmpty()) {
            $this->info('No duplicate leave types found.');
            return;
        }
        
        $this->info("Found {$duplicateGroups->count()} groups with duplicates:");
        
        foreach ($duplicateGroups as $group) {
            $this->line("- {$group->name}: {$group->count} duplicates");
        }
        
        if (!$this->confirm('Do you want to proceed with cleanup?')) {
            $this->info('Cleanup cancelled.');
            return;
        }
        
        DB::transaction(function () use ($duplicateGroups) {
            foreach ($duplicateGroups as $group) {
                $this->cleanupDuplicateGroup($group->name);
            }
        });
        
        $this->info('Cleanup completed successfully!');
        
        // Show final count
        $finalCount = LeaveType::count();
        $this->info("Final leave types count: {$finalCount}");
    }
    
    private function cleanupDuplicateGroup($name)
    {
        $this->line("Cleaning up duplicates for: {$name}");
        
        // Get all leave types with this name, ordered by ID (keep the first one)
        $leaveTypes = LeaveType::where('name', $name)->orderBy('id')->get();
        
        if ($leaveTypes->count() <= 1) {
            return; // No duplicates
        }
        
        // Keep the first one, merge others into it
        $keepLeaveType = $leaveTypes->first();
        $duplicates = $leaveTypes->skip(1);
        
        $this->line("  Keeping ID {$keepLeaveType->id}, removing " . $duplicates->count() . " duplicates");
        
        // Update all leaves that reference the duplicate leave types
        foreach ($duplicates as $duplicate) {
            $affectedLeaves = Leave::where('leave_type_id', $duplicate->id)->count();
            if ($affectedLeaves > 0) {
                $this->line("    Moving {$affectedLeaves} leaves from ID {$duplicate->id} to ID {$keepLeaveType->id}");
                Leave::where('leave_type_id', $duplicate->id)
                    ->update(['leave_type_id' => $keepLeaveType->id]);
            }
            
            // Delete the duplicate
            $duplicate->delete();
            $this->line("    Deleted duplicate ID {$duplicate->id}");
        }
    }
}
