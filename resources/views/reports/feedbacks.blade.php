@extends('layouts.report')

@section('title', 'Feedbacks Report')
@section('report_type', 'Feedbacks Report')

@section('content')
    <table>
        <thead>
            <tr>
                <th>Reviewer</th>
                <th>Reviewee</th>
                <th>Period</th>
                <th>Rating</th>
                <th>Comments</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($feedbacks as $feedback)
                <tr>
                    <td>{{ $feedback->reviewer->name }}</td>
                    <td>{{ $feedback->reviewee->name }}</td>
                    <td>{{ $feedback->period }}</td>
                    <td>{{ $feedback->rating }}</td>
                    <td>{{ $feedback->comments }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection