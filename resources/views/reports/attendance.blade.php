@extends('layouts.report')

@section('title', 'Attendance Report')
@section('report_type', 'Attendance Report')

@section('content')
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($attendances as $attendance)
                <tr>
                    <td>{{ $attendance->employee->user->name }}</td>
                    <td>{{ $attendance->clock_in }}</td>
                    <td>{{ $attendance->clock_out }}</td>
                    <td>{{ $attendance->notes }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection