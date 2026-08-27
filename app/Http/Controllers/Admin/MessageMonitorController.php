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
            ->whereNull('m.admin_deleted_at')      // ← hide admin-deleted
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
            ->whereNull('m.admin_deleted_at')      // ← hide admin-deleted
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
            
            // Add file detection to each message
            $messages->getCollection()->transform(function ($msg) {
                $msg->has_file = $this->detectFile($msg->message);
                $msg->file_info = $msg->has_file ? $this->extractFileInfo($msg->message) : null;
                return $msg;
            });
            
            $total    = (clone $query)->count();
        } else {
            $query    = $this->directQuery($f);
            $messages = $query->paginate($perPage)->withQueryString();
            
            // Add file detection to each message
            $messages->getCollection()->transform(function ($msg) {
                $msg->has_file = $this->detectFile($msg->message);
                $msg->file_info = $msg->has_file ? $this->extractFileInfo($msg->message) : null;
                return $msg;
            });
            
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

    // ─── Admin delete a message ───────────────────────────────────────────────

    public function destroyMessage(Message $message)
    {
        DB::table('messages')
            ->where('id', $message->id)
            ->update([
                'admin_deleted_at' => now(),
                'admin_deleted_by' => auth()->id(),
            ]);

        return response()->json(['ok' => true]);
    }

    // ─── File detection helpers ───────────────────────────────────────────────

    private function detectFile($message)
    {
        if (!$message) return false;
        
        // Check for file patterns
        return (
            str_contains($message, 'rt-file-attachment') || // Rich text editor files
            preg_match('/\b(doc|attendance_report|file)_\d+_\d+_\d+_[a-f0-9]+/i', $message) || // Filename pattern
            preg_match('/\.(pdf|docx?|xlsx?|txt|csv|pptx?|zip|rar)\b/i', $message) // File extensions
        );
    }

    private function extractFileInfo($message)
    {
        if (!$message) return null;

        // Try to parse HTML if it contains rt-file-attachment
        if (str_contains($message, 'rt-file-attachment')) {
            // Extract filename and URL from HTML: <a href="..." download="...">
            if (preg_match('/<a[^>]+href=["\']([^"\']+)["\'][^>]+download=["\']([^"\']+)["\'][^>]*>/', $message, $matches)) {
                $url = $matches[1];
                $filename = $matches[2];
                
                // Extract file extension
                $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                
                // Try to get file size
                $sizeBytes = 0;
                if (preg_match('/\/documents\/([^?]+)/', $url, $urlMatches)) {
                    $urlFilename = $urlMatches[1];
                    $storagePath = 'chat-documents/' . $urlFilename;
                    
                    if (\Storage::disk('local')->exists($storagePath)) {
                        $sizeBytes = \Storage::disk('local')->size($storagePath);
                    }
                }
                
                return [
                    'filename' => $filename,
                    'url' => $url,
                    'size' => $sizeBytes, // Return bytes, not formatted string
                    'extension' => $extension,
                    'type' => $this->getFileType($filename),
                ];
            }
        }

        // Extract from plain text filename pattern
        $plainText = strip_tags($message);
        
        // Check for common filename patterns
        if (preg_match('/([a-zA-Z0-9_-]+\.(pdf|docx?|xlsx?|txt|csv|pptx?|zip|rar))/i', $plainText, $matches)) {
            $filename = $matches[0];
            $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            
            return [
                'filename' => $filename,
                'url' => null,
                'size' => 0,
                'extension' => $extension,
                'type' => $this->getFileType($filename),
            ];
        }

        // If message looks like a filename (starts with doc_, file_, etc.)
        if (preg_match('/^(doc|file|attendance_report)_\d+_\d+_\d+_[a-f0-9]+/i', $plainText)) {
            // Truncate long filenames
            $displayName = strlen($plainText) > 50 ? substr($plainText, 0, 47) . '...' : $plainText;
            
            return [
                'filename' => $displayName,
                'url' => null,
                'size' => 0,
                'extension' => 'unknown',
                'type' => 'document',
            ];
        }

        return null;
    }

    private function formatFileSize($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' B';
        }
    }

    private function getFileType($filename)
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        $types = [
            'pdf' => 'PDF Document',
            'doc' => 'Word Document',
            'docx' => 'Word Document',
            'xls' => 'Excel Spreadsheet',
            'xlsx' => 'Excel Spreadsheet',
            'ppt' => 'PowerPoint',
            'pptx' => 'PowerPoint',
            'txt' => 'Text File',
            'csv' => 'CSV File',
            'zip' => 'Archive',
            'rar' => 'Archive',
        ];

        return $types[$extension] ?? 'Document';
    }
}
