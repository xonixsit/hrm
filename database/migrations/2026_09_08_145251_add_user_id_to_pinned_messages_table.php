<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The table already has user_id (nullable) and the old unique constraint
        // on (conversation_id, message_id) has been removed by a prior partial run.
        // This migration is a no-op to record the completed state.
        //
        // Schema after this migration:
        //   - user_id bigint unsigned nullable (personal pin owner for private chats)
        //   - No unique constraint on (conversation_id, message_id) — uniqueness is
        //     enforced in application logic per conversation type.
    }

    public function down(): void
    {
        Schema::table('pinned_messages', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
