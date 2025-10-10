<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Competency;
use Inertia\Inertia;

class CompetencyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $competencies = Competency::all();
        return Inertia::render('Admin/Competencies/Index', [
            'competencies' => $competencies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'measure_of_success' => 'required|string',
        ]);

        Competency::create([
            'name' => $request->name,
            'description' => $request->description,
            'measure_of_success' => $request->measure_of_success,
        ]);

        return redirect()->route('competencies.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Competencies/Create');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Competency $competency)
    {
        return Inertia::render('Admin/Competencies/Edit', [
            'competency' => $competency,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Competency $competency)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'measure_of_success' => 'required|string',
        ]);

        $competency->update([
            'name' => $request->name,
            'description' => $request->description,
            'measure_of_success' => $request->measure_of_success,
        ]);

        return redirect()->route('competencies.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Competency $competency)
    {
        $competency->delete();

        return redirect()->route('competencies.index');
    }
}
