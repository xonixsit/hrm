<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompetencyAssessmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'competency_id' => 'required|exists:competencies,id',
            'assessment_type' => 'required|in:self,manager,peer,360',
            'assessment_cycle_id' => 'nullable|exists:assessment_cycles,id',
            'rating' => 'nullable|integer|min:1|max:5',
            'comments' => 'nullable|string|max:2000',
            'evidence_files' => 'nullable|array',
            'development_notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:draft,submitted'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Please select an employee.',
            'employee_id.exists' => 'The selected employee is invalid.',
            'competency_id.required' => 'Please select a competency.',
            'competency_id.exists' => 'The selected competency is invalid.',
            'assessment_type.required' => 'Please select an assessment type.',
            'assessment_type.in' => 'The selected assessment type is invalid.',
            'rating.integer' => 'The rating must be a number.',
            'rating.min' => 'The rating must be at least 1.',
            'rating.max' => 'The rating cannot be more than 5.',
            'comments.max' => 'Comments cannot exceed 2000 characters.',
            'development_notes.max' => 'Development notes cannot exceed 1000 characters.',
            'status.in' => 'The status must be either draft or submitted.'
        ];
    }

    /**
     * Get the proper failed validation response for Inertia.
     */
    public function response(array $errors)
    {
        if ($this->expectsJson()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $errors,
            ], 422);
        }

        return redirect()->back()
            ->withInput($this->except($this->dontFlash))
            ->withErrors($errors, $this->errorBag);
    }
}