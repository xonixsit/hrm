@extends('layouts.report')

@section('title', 'Timesheets Report')
@section('report_type', 'Timesheets Report')

@section('content')
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Project</th>
                <th>Task</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Description</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($timesheets as $timesheet)
                <tr>
                    <td>{{ $timesheet->employee->user->name }}</td>
                    <td>{{ $timesheet->project->name }}</td>
                    <td>{{ $timesheet->task->name }}</td>
                    <td>{{ $timesheet->date }}</td>
                    <td>{{ $timesheet->hours }}</td>
                    <td>{{ $timesheet->description }}</td>
                    <td>{{ $timesheet->status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection