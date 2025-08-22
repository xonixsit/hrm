<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AssignAdminRoleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:assign-admin-role {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assigns the admin role to a user by email.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $user = \App\Models\User::where('email', $email)->first();

        if ($user) {
            $user->assignRole('admin');
            $this->info("Admin role assigned to user: {$email}");
        } else {
            $this->error("User with email {$email} not found.");
        }

        //
    }
}
