<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Binkode\ChatSystem\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MessageMonitorController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            abort_unless(
                auth()->check() && auth()->user()->hasAnyRole(['Admin', 'super-admin']),
                403,
                'Admin access required.'
            );
            return $next($request);
        });
    }

    // ─── Shared filter helpers ────────────────────────────────────────────────

    private function baseFilters(Request $request): array
    {
        return [
            'from_date' => $request->get('from_date', now()->toDateString()),
            'to_date'   => $request->get('to_date',   now()->toDateString()),
            'from_user' => $request->get('from_user'),
            'keyword'   => $request->get('keyword'),
        ];
    }

    // ─── Direct (1-on-1) messages query ──────────────────────────────────────

    private function directQuery(array $f)
    {
        $q = DB::table('messages as m')
            ->join('conversations as c', 'c.id', '=', 'm.conversation_id')
            ->join('conversation_users as cu_sender', function ($j) {
                $j->on('cu_sender.conversation_id', '=', 'm.conversation_id')
                  ->whereColumn('cu_sender.user_id', '=', 'm.user_id');
            })
            ->join('conversation_users as cu_recipient', function ($j) {
                $j->on('cu_recipient.conversation_id', '=', 'm.conversation_id')
                  ->whereColumn('cu_recipient.user_id', '!=', 'm.user_id');
            })
            ->join('users as sender',    'sender.id',    '=', 'm.user_id')
            ->join('users as recipient', 'recipient.id', '=', 'cu_recipient.user_id')
            ->where('m.type', 'user')
            ->where('c.type', 'private')          // ← private only
            ->whereDate('m.created_at', '>=', $f['from_date'])
            ->whereDate('m.created_at', '<=', $f['to_date'])
            ->select(
                'm.id', 'm.message', 'm.created_at', 'm.conversation_id',
                'sender.id    as sender_id',
                'sender.name  as sender_name',
                'sender.email as sender_email',
                'recipient.id    as recipient_id',
                'recipient.name  as recipient_name',
                'recipient.email as recipient_email'
            )
            ->orderBy('m.created_at', 'desc');

        if ($f['from_user']) $q->where('sender.id', $f['from_user']);
        if ($f['keyword'])   $q->where('m.message', 'like', '%' . $f['keyword'] . '%');

        if ($toUser = request('to_user')) {
            $q->where('recipient.id', $toUser);
        }

        return $q;
    }

    // ─── Group messages query ─────────────────────────────────────────────────

    private function groupQuery(array $f)
    {
        $q = DB::table('messages as m')
            ->join('conversations as c', 'c.id', '=', 'm.conversation_id')
            ->join('users as sender', 'sender.id', '=', 'm.user_id')
            ->where('m.type', 'user')
            ->where('c.type', 'group')            // ← group only
            ->whereDate('m.created_at', '>=', $f['from_date'])
            ->whereDate('m.created_at', '<=', $f['to_date'])
            ->select(
                'm.id', 'm.message', 'm.created_at', 'm.conversation_id',
                'c.name        as group_name',
                'c.is_default  as is_default_group',
                'sender.id     as sender_id',
                'sender.name   as sender_name',
                'sender.email  as sender_email'
            )
            ->orderBy('m.created_at', 'desc');

        if ($f['from_user']) $q->where('sender.id', $f['from_user']);
        if ($f['keyword'])   $q->where('m.message', 'like', '%' . $f['keyword'] . '%');

        if ($groupId = request('group_id')) {
            $q->where('m.conversation_id', $groupId);
        }

        return $q;
    }

    // ─── Index ────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $f       = $this->baseFilters($request);
        $tab     = $request->get('tab', 'direct'); // 'direct' | 'groups'
        $perPage = 50;

        $users = User::orderBy('name')->get(['id', 'name', 'email']);

        // Group list for filter dropdown (groups tab)
        $groups = DB::table('conversations')
            ->where('type', 'group')
            ->orderBy('name')
            ->get(['id', 'name', 'is_default']);

        if ($tab === 'groups') {
            $query    = $this->groupQuery($f);
            $messages = $query->paginate($perPage)->withQueryString();
            $total    = (clone $query)->count();
        } else {
            $query    = $this->directQuery($f);
            $messages = $query->paginate($perPage)->withQueryString();
            $total    = (clone $query)->count();
        }

        $activeUsers = DB::table('messages')
            ->where('type', 'user')
            ->whereDate('created_at', '>=', $f['from_date'])
            ->whereDate('created_at', '<=', $f['to_date'])
            ->distinct('user_id')
            ->count('user_id');

        return Inertia::render('Admin/MessageMonitor/Index', [
            'messages' => $messages,
            'users'    => $users,
            'groups'   => $groups,
            'tab'      => $tab,
            'filters'  => array_merge($f, [
                'to_user'  => $request->get('to_user'),
                'group_id' => $request->get('group_id'),
                'tab'      => $tab,
            ]),
            'stats' => [
                'total_messages' => $total,
                'active_users'   => $activeUsers,
            ],
        ]);
    }

    // ─── Export ───────────────────────────────────────────────────────────────

    public function export(Request $request)
    {
        $f   = $this->baseFilters($request);
        $tab = $request->get('tab', 'direct');

        if ($tab === 'groups') {
            $rows     = $this->groupQuery($f)->get();
            $filename = "group_messages_{$f['from_date']}_to_{$f['to_date']}.csv";

            $headers = [
                'Content-Type'        => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function () use ($rows) {
                $out = fopen('php://output', 'w');
                fwrite($out, "\xEF\xBB\xBF");
                fputcsv($out, ['#', 'Group', 'Sender Name', 'Sender Email', 'Message', 'Date & Time']);
                foreach ($rows as $i => $row) {
                    fputcsv($out, [
                        $i + 1,
                        $row->group_name,
                        $row->sender_name,
                        $row->sender_email,
                        $row->message,
                        $row->created_at,
                    ]);
                }
                fclose($out);
            };
        } else {
            $rows     = $this->directQuery($f)->get();
            $filename = "direct_messages_{$f['from_date']}_to_{$f['to_date']}.csv";

            $headers = [
                'Content-Type'        => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function () use ($rows) {
                $out = fopen('php://output', 'w');
                fwrite($out, "\xEF\xBB\xBF");
                fputcsv($out, ['#', 'From Name', 'From Email', 'To Name', 'To Email', 'Message', 'Date & Time']);
                foreach ($rows as $i => $row) {
                    fputcsv($out, [
                        $i + 1,
                        $row->sender_name,
                        $row->sender_email,
                        $row->recipient_name,
                        $row->recipient_email,
                        $row->message,
                        $row->created_at,
                    ]);
                }
                fclose($out);
            };
        }

        return response()->stream($callback, 200, $headers);
    }
}
