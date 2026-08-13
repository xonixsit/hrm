<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\User;
use Binkode\ChatSystem\Models\Conversation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Creates (or syncs) the default "Company" group conversation.
 *
 * - Creates the group if it doesn't exist yet.
 * - Adds any active employees who are not yet members.
 * - Does NOT remove users who have since been deactivated (keeps history).
 *
 * Run on deploy or via the scheduler to stay in sync.
 */
class EnsureCompanyGroup extends Command
{
    protected $signature   = 'chat:ensure-company-group';
    protected $description = 'Create or sync the default Company group chat with all active employees';

    public function handle(): int
    {
        // ── Find or create the default company group ──────────────────────────
        $group = Conversation::where('is_default', true)
            ->where('type', 'group')
            ->first();

        // Pick a "system" owner — the oldest admin, or the first user
        $owner = User::role('Admin')->orderBy('id')->first()
            ?? User::orderBy('id')->first();

        if (! $owner) {
            $this->error('No users found — cannot create company group.');
            return self::FAILURE;
        }

        if (! $group) {
            $group = Conversation::create([
                'user_id'    => $owner->id,
                'name'       => 'Company',
                'type'       => 'group',
                'is_default' => true,
            ]);
            $this->info("Created Company group (id: {$group->id}).");
        } else {
            $this->info("Company group already exists (id: {$group->id}).");
        }

        // ── Sync active employees ─────────────────────────────────────────────
        $activeUserIds = Employee::active()
            ->whereNotNull('user_id')
            ->pluck('user_id')
            ->unique()
            ->values()
            ->toArray();

        $existingMemberIds = DB::table('conversation_users')
            ->where('conversation_id', $group->id)
            ->pluck('user_id')
            ->toArray();

        $toAdd = array_diff($activeUserIds, $existingMemberIds);

        if (count($toAdd) === 0) {
            $this->info('All active employees are already members.');
            return self::SUCCESS;
        }

        $now     = now();
        $inserts = array_map(fn ($uid) => [
            'user_id'         => $uid,
            'conversation_id' => $group->id,
            'created_at'      => $now,
            'updated_at'      => $now,
        ], array_values($toAdd));

        DB::table('conversation_users')->insert($inserts);

        $this->info('Added ' . count($toAdd) . ' new member(s) to Company group.');
        return self::SUCCESS;
    }
}
