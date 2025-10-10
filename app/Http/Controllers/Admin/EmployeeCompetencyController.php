<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmployeeCompetency;
use App\Models\Employee;
use App\Models\Competency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeCompetencyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/EmployeeCompetencies/Index', [
            'employeeCompetencies' => EmployeeCompetency::with(['employee', 'competency'])->get(),
            'employees' => Employee::all(),
            'competencies' => Competency::all(),
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
            'level' => 'required|integer|min:1|max:5',
        ]);

        EmployeeCompetency::create($request->all());

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
    public function update(Request $request, EmployeeCompetency $employeeCompetency)
    {
        $request->validate([
            'level' => 'required|integer|min:1|max:5',
        ]);

        $employeeCompetency->update($request->all());

        return redirect()->route('employee-competencies.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmployeeCompetency $employeeCompetency)
    {
        $employeeCompetency->delete();

        return redirect()->route('employee-competencies.index');
    }
}
