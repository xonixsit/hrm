<?php

namespace App\Console\Commands;

use App\Models\User;
use Binkode\ChatSystem\Models\Conversation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CreateCompanyGroup extends Command
{
    protected $signature   = 'messaging:create-company-group';
    protected $description = 'Create the company-wide announcements group and add all users';

    public function handle(): void
    {
        $groupName = 'Company Announcements';

        // Check if already exists
        $existing = Conversation::where('name', $groupName)->where('type', 'group')->first();
        if ($existing) {
            $this->info("Group '{$groupName}' already exists (ID: {$existing->id}).");
            $this->syncMembers($existing);
            return;
        }

        // Get admin user to set as creator
        $admin = User::role('Admin')->first() ?? User::first();

        $conv = Conversation::create([
            'user_id' => $admin->id,
            'name'    => $groupName,
            'type'    => 'group',
        ]);

        $this->syncMembers($conv);

        $this->info("Created '{$groupName}' (ID: {$conv->id}) with all users.");
    }

    private function syncMembers(Conversation $conv): void
    {
        $allUserIds = User::pluck('id')->toArray();
        $existing   = DB::table('conversation_users')
            ->where('conversation_id', $conv->id)
            ->pluck('user_id')
            ->toArray();

        $toAdd = array_diff($allUserIds, $existing);
        if (!empty($toAdd)) {
            $inserts = array_map(fn($uid) => [
                'user_id'         => $uid,
                'conversation_id' => $conv->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ], $toAdd);
            DB::table('conversation_users')->insert($inserts);
            $this->info("Added " . count($toAdd) . " new member(s) to the group.");
        } else {
            $this->info("All users already in the group.");
        }
    }
}
