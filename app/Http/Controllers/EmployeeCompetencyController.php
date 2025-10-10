<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Competency;
use App\Models\EmployeeCompetency;
use Inertia\Inertia;

class EmployeeCompetencyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employees = Employee::all();
        $competencies = Competency::all();
        $assessments = EmployeeCompetency::with(['employee', 'competency'])->get();

        return Inertia::render('Admin/Competencies/Assess', [
            'employees' => $employees,
            'competencies' => $competencies,
            'assessments' => $assessments,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'competency_id' => 'required|exists:competencies,id',
            'rating' => 'required|integer|min:1|max:5',
            'comments' => 'nullable|string',
        ]);

        EmployeeCompetency::create([
            'employee_id' => $request->employee_id,
            'competency_id' => $request->competency_id,
            'rating' => $request->rating,
            'comments' => $request->comments,
        ]);

        return redirect()->route('employee-competencies.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
