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

    public function index(Request $request)
    {
        $fromDate   = $request->get('from_date', now()->toDateString());
        $toDate     = $request->get('to_date',   now()->toDateString());
        $fromUser   = $request->get('from_user');
        $toUser     = $request->get('to_user');
        $keyword    = $request->get('keyword');
        $perPage    = 50;

        // All users for filter dropdowns
        $users = User::orderBy('name')->get(['id', 'name', 'email']);

        // Build query — flat report: sender → recipient → message → date
        $query = DB::table('messages as m')
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
            ->whereDate('m.created_at', '>=', $fromDate)
            ->whereDate('m.created_at', '<=', $toDate)
            ->select(
                'm.id',
                'm.message',
                'm.created_at',
                'm.conversation_id',
                'sender.id    as sender_id',
                'sender.name  as sender_name',
                'sender.email as sender_email',
                'recipient.id    as recipient_id',
                'recipient.name  as recipient_name',
                'recipient.email as recipient_email'
            )
            ->orderBy('m.created_at', 'desc');

        if ($fromUser) {
            $query->where('sender.id', $fromUser);
        }
        if ($toUser) {
            $query->where('recipient.id', $toUser);
        }
        if ($keyword) {
            $query->where('m.message', 'like', '%' . $keyword . '%');
        }

        $messages = $query->paginate($perPage)->withQueryString();

        // Summary stats for the selected period
        $totalMessages = (clone $query)->count();
        $activeUsers   = DB::table('messages')
            ->where('type', 'user')
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate)
            ->distinct('user_id')
            ->count('user_id');

        return Inertia::render('Admin/MessageMonitor/Index', [
            'messages'      => $messages,
            'users'         => $users,
            'filters'       => [
                'from_date' => $fromDate,
                'to_date'   => $toDate,
                'from_user' => $fromUser ? (int)$fromUser : null,
                'to_user'   => $toUser   ? (int)$toUser   : null,
                'keyword'   => $keyword,
            ],
            'stats' => [
                'total_messages' => $totalMessages,
                'active_users'   => $activeUsers,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $fromDate = $request->get('from_date', now()->toDateString());
        $toDate   = $request->get('to_date',   now()->toDateString());
        $fromUser = $request->get('from_user');
        $toUser   = $request->get('to_user');
        $keyword  = $request->get('keyword');

        $query = DB::table('messages as m')
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
            ->whereDate('m.created_at', '>=', $fromDate)
            ->whereDate('m.created_at', '<=', $toDate)
            ->select('m.id','sender.name as sender_name','sender.email as sender_email',
                     'recipient.name as recipient_name','recipient.email as recipient_email',
                     'm.message','m.created_at')
            ->orderBy('m.created_at', 'asc');

        if ($fromUser) $query->where('sender.id', $fromUser);
        if ($toUser)   $query->where('recipient.id', $toUser);
        if ($keyword)  $query->where('m.message', 'like', '%' . $keyword . '%');

        $rows     = $query->get();
        $filename = "messages_{$fromDate}_to_{$toDate}.csv";

        $headers  = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($rows) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM for Excel UTF-8
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

        return response()->stream($callback, 200, $headers);
    }
}
