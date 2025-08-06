@extends('layouts.report')

@section('title', 'Leaves Report')
@section('report_type', 'Leaves Report')

@section('content')
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Status</th>
                <th>Reason</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($leaves as $leave)
                <tr>
                    <td>{{ $leave->employee->user->name }}</td>
                    <td>{{ $leave->leave_type->name }}</td>
                    <td>{{ $leave->from_date }}</td>
                    <td>{{ $leave->to_date }}</td>
                    <td>{{ $leave->status }}</td>
                    <td>{{ $leave->reason }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection