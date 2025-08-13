<?php

namespace App\Http\Controllers;

use App\Models\WorkReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Traits\AuditLogTrait;

class WorkReportController extends Controller
{
    use AuditLogTrait;

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('Admin') || $user->hasRole('Manager')) {
            $workReports = WorkReport::with('employee.user')->paginate(10);
        } else {
            $employee = $user->employee;
            $workReports = WorkReport::where('employee_id', $employee->id)->paginate(10);
        }
        return Inertia::render('WorkReports/Index', ['workReports' => $workReports]);
    }

    public function create()
    {
        return Inertia::render('WorkReports/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'calls' => 'required|integer|min:0',
            'emails' => 'required|integer|min:0',
            'whatsapp' => 'required|integer|min:0',
            'sms' => 'required|integer|min:0',
        ]);

        $validated['employee_id'] = Auth::user()->employee->id;

        WorkReport::create($validated);

        $this->logAudit('Work Report Created', 'Created work report for date: ' . $validated['date']);
        return redirect()->route('work-reports.index')->with('success', 'Work report submitted.');
    }

    public function show(WorkReport $workReport)
    {
        $workReport->load('employee.user');
        return Inertia::render('WorkReports/Show', ['workReport' => $workReport]);
    }

    public function edit(WorkReport $workReport)
    {
        return Inertia::render('WorkReports/Edit', ['workReport' => $workReport]);
    }

    public function update(Request $request, WorkReport $workReport)
    {
        $this->authorize('update', $workReport);

        $validated = $request->validate([
            'date' => 'required|date',
            'calls' => 'required|integer|min:0',
            'emails' => 'required|integer|min:0',
            'whatsapp' => 'required|integer|min:0',
            'sms' => 'required|integer|min:0',
        ]);

        $workReport->update($validated);

        $this->logAudit('Work Report Updated', 'Updated work report ID: ' . $workReport->id);
        return redirect()->route('work-reports.index')->with('success', 'Work report updated.');
    }

    public function destroy(WorkReport $workReport)
    {
        $this->authorize('delete', $workReport);

        $workReport->delete();

        $this->logAudit('Work Report Deleted', 'Deleted work report ID: ' . $workReport->id);
        return redirect()->route('work-reports.index')->with('success', 'Work report deleted.');
    }
}