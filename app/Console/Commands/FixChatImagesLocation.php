<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class FixChatImagesLocation extends Command
{
    protected $signature = 'chat:fix-image-location';
    protected $description = 'Move chat images from wrong location (private/private/chat-images) to correct location (private/chat-images)';

    public function handle()
    {
        $wrongPath = storage_path('app/private/private/chat-images');
        $correctPath = storage_path('app/private/chat-images');
        
        // Check if wrong path exists
        if (!File::isDirectory($wrongPath)) {
            $this->info('No files found in wrong location. Nothing to fix.');
            return 0;
        }
        
        // Create correct directory if it doesn't exist
        if (!File::isDirectory($correctPath)) {
            File::makeDirectory($correctPath, 0755, true);
            $this->info('Created directory: ' . $correctPath);
        }
        
        // Get all files from wrong location
        $files = File::files($wrongPath);
        
        if (empty($files)) {
            $this->info('No files to move.');
            // Remove empty directory structure
            File::deleteDirectory(storage_path('app/private/private'));
            $this->info('Removed empty directory: storage/app/private/private');
            return 0;
        }
        
        $movedCount = 0;
        $this->info('Found ' . count($files) . ' files to move...');
        
        foreach ($files as $file) {
            $filename = basename($file);
            $destination = $correctPath . '/' . $filename;
            
            // Check if file already exists in destination
            if (File::exists($destination)) {
                $this->warn('Skipped (already exists): ' . $filename);
                continue;
            }
            
            // Move the file
            if (File::move($file, $destination)) {
                $this->info('Moved: ' . $filename);
                $movedCount++;
            } else {
                $this->error('Failed to move: ' . $filename);
            }
        }
        
        // Remove the wrong directory structure
        if (File::deleteDirectory(storage_path('app/private/private'))) {
            $this->info('Removed directory: storage/app/private/private');
        }
        
        $this->info('');
        $this->info('✓ Migration complete!');
        $this->info("Moved {$movedCount} files to correct location.");
        
        return 0;
    }
}
