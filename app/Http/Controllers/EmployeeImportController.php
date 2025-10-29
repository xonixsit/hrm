<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Jobs\ProcessEmployeeImport;
use App\Jobs\SendWelcomeEmail;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use League\Csv\Reader;
use Spatie\Permission\Models\Role;

class EmployeeImportController extends Controller
{
    public function index()
    {
        $departments = Department::select('id', 'name')->get();
        $roles = Role::select('id', 'name')->get();
        
        return Inertia::render('Employees/Import', [
            'departments' => $departments,
            'roles' => $roles
        ]);
    }

    public function template(Request $request)
    {
        $format = $request->get('format', 'excel');
        
        $headers = [
            'Name',
            'Email',
            'Job Title',
            'Department',
            'Phone',
            'Join Date',
            'Salary',
            'Contract Type',
            'Role'
        ];
        
        // Get available roles for sample data
        $availableRoles = Role::pluck('name')->toArray();
        $sampleRole1 = in_array('Employee', $availableRoles) ? 'Employee' : ($availableRoles[0] ?? 'Employee');
        $sampleRole2 = in_array('Manager', $availableRoles) ? 'Manager' : ($availableRoles[0] ?? 'Employee');
        
        $sampleData = [
            [
                'John Doe',
                'john.doe@company.com',
                'Software Engineer',
                'Engineering',
                '+1234567890',
                '2024-01-15',
                '75000',
                'Full-time',
                $sampleRole1
            ],
            [
                'Jane Smith',
                'jane.smith@company.com',
                'Marketing Manager',
                'Marketing',
                '+1234567891',
                '2024-02-01',
                '85000',
                'Permanent',
                $sampleRole2
            ],
            [
                'Mike Johnson',
                'mike.johnson@company.com',
                'Sales Representative',
                'Sales',
                '+1234567892',
                '2024-03-01',
                '55000',
                'Contract',
                $sampleRole1
            ]
        ];
        
        if ($format === 'csv') {
            return $this->generateCsvTemplate($headers, $sampleData);
        } else {
            return $this->generateExcelTemplate($headers, $sampleData);
        }
    }

    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240'
        ]);

        try {
            $file = $request->file('file');
            $columns = $this->extractColumns($file);
            
            return response()->json([
                'success' => true,
                'columns' => $columns
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to read file: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
            'column_mapping' => 'required|json',
            'options' => 'required|json'
        ]);

        $file = $request->file('file');
        $columnMapping = json_decode($request->column_mapping, true);
        $options = json_decode($request->options, true);

        try {
            // Parse the file and extract data
            $data = $this->parseFile($file, $columnMapping, $options);
            
            // Validate the data
            $validationResults = $this->validateImportData($data);
            
            if ($validationResults['hasErrors'] && $options['errorHandling'] === 'stop') {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation errors found. Import stopped.',
                    'errors' => $validationResults['errors']
                ], 422);
            }

            // Process the import
            $results = $this->processImport($validationResults['validData'], $options);
            
            return response()->json([
                'success' => true,
                'message' => 'Import completed successfully.',
                'results' => $results,
                'errors' => $validationResults['errors']
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    private function parseFile($file, $columnMapping, $options)
    {
        $data = [];
        $extension = $file->getClientOriginalExtension();

        if (in_array($extension, ['xlsx', 'xls'])) {
            $data = $this->parseExcelFile($file, $columnMapping, $options);
        } elseif ($extension === 'csv') {
            $data = $this->parseCsvFile($file, $columnMapping, $options);
        }

        return $data;
    }

    private function parseExcelFile($file, $columnMapping, $options)
    {
        $spreadsheet = IOFactory::load($file->getPathname());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        $data = [];
        $startRow = $options['skipFirstRow'] ? 1 : 0;

        for ($i = $startRow; $i < count($rows); $i++) {
            $row = $rows[$i];
            $rowData = [];

            foreach ($columnMapping as $field => $column) {
                $columnIndex = $this->getColumnIndex($column, $rows[0] ?? []);
                $rowData[$field] = $columnIndex !== false ? ($row[$columnIndex] ?? '') : '';
            }

            if ($this->isRowEmpty($rowData)) {
                continue;
            }

            $rowData['_row_number'] = $i + 1;
            $data[] = $rowData;
        }

        return $data;
    }

    private function parseCsvFile($file, $columnMapping, $options)
    {
        $csv = Reader::createFromPath($file->getPathname(), 'r');
        $csv->setHeaderOffset($options['skipFirstRow'] ? 0 : null);
        
        $data = [];
        $rowNumber = $options['skipFirstRow'] ? 2 : 1;

        foreach ($csv as $row) {
            $rowData = [];

            foreach ($columnMapping as $field => $column) {
                $rowData[$field] = $row[$column] ?? '';
            }

            if ($this->isRowEmpty($rowData)) {
                continue;
            }

            $rowData['_row_number'] = $rowNumber;
            $data[] = $rowData;
            $rowNumber++;
        }

        return $data;
    }

    private function getColumnIndex($columnName, $headers)
    {
        return array_search($columnName, $headers);
    }

    private function isRowEmpty($rowData)
    {
        $values = array_filter($rowData, function($value, $key) {
            return $key !== '_row_number' && !empty(trim($value));
        }, ARRAY_FILTER_USE_BOTH);

        return empty($values);
    }

    private function validateImportData($data)
    {
        $validData = [];
        $errors = [];
        $hasErrors = false;

        foreach ($data as $index => $row) {
            // Get available roles dynamically
            $availableRoles = Role::pluck('name')->toArray();
            
            $validator = Validator::make($row, [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'job_title' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:20',
                'join_date' => 'nullable|date',
                'salary' => 'nullable|numeric|min:0',
                'contract_type' => 'nullable|string|in:Full-time,Part-time,Contract,Temporary,Permanent',
                'role' => 'nullable|string|in:' . implode(',', $availableRoles)
            ]);

            if ($validator->fails()) {
                $hasErrors = true;
                $errors[] = [
                    'row' => $row['_row_number'],
                    'message' => implode(', ', $validator->errors()->all())
                ];
            } else {
                $validData[] = $row;
            }
        }

        return [
            'validData' => $validData,
            'errors' => $errors,
            'hasErrors' => $hasErrors
        ];
    }

    private function processImport($data, $options)
    {
        $successful = 0;
        $failed = 0;
        $updated = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            foreach ($data as $row) {
                try {
                    // Check if user exists (for update option)
                    $existingUser = null;
                    if ($options['updateExisting']) {
                        $existingUser = User::where('email', $row['email'])->first();
                    }

                    if ($existingUser) {
                        // Update existing user
                        $this->updateEmployee($existingUser, $row);
                        $updated++;
                    } else {
                        // Create new user and employee
                        $user = $this->createUser($row);
                        $employee = $this->createEmployee($user, $row);
                        
                        // Send welcome email with credentials if requested
                        if ($options['sendWelcomeEmails']) {
                            SendWelcomeEmail::dispatch($user, $user->plain_password);
                        }
                        
                        $successful++;
                    }
                } catch (\Exception $e) {
                    $failed++;
                    $errors[] = [
                        'row' => $row['_row_number'],
                        'message' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return [
                'successful' => $successful,
                'failed' => $failed,
                'updated' => $updated,
                'total' => count($data),
                'errors' => $errors
            ];

        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    private function createUser($row)
    {
        $password = Str::random(12);
        
        $user = User::create([
            'name' => $row['name'],
            'email' => $row['email'],
            'password' => Hash::make($password),
            'email_verified_at' => now(),
            'password_reset_required' => true
        ]);
        
        // Assign role to user
        $roleName = $row['role'] ?? 'Employee';
        $role = Role::where('name', $roleName)->first();
        if ($role) {
            $user->assignRole($role);
        } else {
            // Try to find Employee role as fallback
            $defaultRole = Role::where('name', 'Employee')->first();
            if ($defaultRole) {
                $user->assignRole($defaultRole);
            }
        }
        
        // Store plain password temporarily for email
        $user->plain_password = $password;
        
        return $user;
    }

    private function createEmployee($user, $row)
    {
        $department = null;
        if (!empty($row['department'])) {
            $department = Department::where('name', $row['department'])->first();
        }

        return Employee::create([
            'user_id' => $user->id,
            'employee_code' => $this->generateEmployeeCode(),
            'job_title' => $row['job_title'] ?? null,
            'department_id' => $department?->id,
            'phone' => $row['phone'] ?? null,
            'join_date' => !empty($row['join_date']) ? $row['join_date'] : now(),
            'salary' => $row['salary'] ?? null,
            'salary_currency' => 'USD',
            'contract_type' => $row['contract_type'] ?? 'Full-time',
            'employment_type' => $this->mapEmploymentType($row['contract_type'] ?? 'Full-time'),
            'status' => 'active'
        ]);
    }

    private function updateEmployee($user, $row)
    {
        // Update user information
        $user->update([
            'name' => $row['name']
        ]);

        // Update user role if provided
        if (!empty($row['role'])) {
            $roleName = $row['role'];
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                // Remove all existing roles and assign the new one
                $user->syncRoles([$role]);
            }
        }

        // Update employee information
        $employee = $user->employee;
        if ($employee) {
            $department = null;
            if (!empty($row['department'])) {
                $department = Department::where('name', $row['department'])->first();
            }

            $employee->update([
                'job_title' => $row['job_title'] ?? $employee->job_title,
                'department_id' => $department?->id ?? $employee->department_id,
                'phone' => $row['phone'] ?? $employee->phone,
                'join_date' => !empty($row['join_date']) ? $row['join_date'] : $employee->join_date,
                'salary' => $row['salary'] ?? $employee->salary,
                'contract_type' => $row['contract_type'] ?? $employee->contract_type,
                'employment_type' => $this->mapEmploymentType($row['contract_type'] ?? $employee->employment_type)
            ]);
        }
    }

    private function generateEmployeeCode()
    {
        do {
            $code = 'EMP' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (Employee::where('employee_code', $code)->exists());

        return $code;
    }

    private function generateCsvTemplate($headers, $sampleData)
    {
        $filename = 'employee_template.csv';
        
        $handle = fopen('php://temp', 'w+');
        
        // Write headers
        fputcsv($handle, $headers);
        
        // Write sample data
        foreach ($sampleData as $row) {
            fputcsv($handle, $row);
        }
        
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);
        
        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    private function extractColumns($file)
    {
        $extension = $file->getClientOriginalExtension();
        
        if (in_array($extension, ['xlsx', 'xls'])) {
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $firstRow = $worksheet->rangeToArray('A1:Z1')[0];
            return array_filter($firstRow, function($cell) {
                return !empty(trim($cell));
            });
        } elseif ($extension === 'csv') {
            $csv = Reader::createFromPath($file->getPathname(), 'r');
            $csv->setHeaderOffset(0);
            return $csv->getHeader();
        }
        
        return [];
    }

    private function generateExcelTemplate($headers, $sampleData)
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $sheet->fromArray($headers, null, 'A1');
        
        // Set sample data
        $sheet->fromArray($sampleData, null, 'A2');
        
        // Style headers
        $headerStyle = [
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E3F2FD']
            ]
        ];
        $sheet->getStyle('A1:I1')->applyFromArray($headerStyle);
        
        // Auto-size columns
        foreach (range('A', 'I') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
        
        $filename = 'employee_template.xlsx';
        
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        $temp = tempnam(sys_get_temp_dir(), 'excel');
        $writer->save($temp);
        
        return response()->download($temp, $filename)->deleteFileAfterSend(true);
    }

    private function mapEmploymentType($contractType)
    {
        $mapping = [
            'Full-time' => 'full_time',
            'Part-time' => 'part_time',
            'Contract' => 'contract',
            'Temporary' => 'contract',
            'Permanent' => 'full_time',
            'Intern' => 'intern',
            'Consultant' => 'consultant'
        ];

        return $mapping[$contractType] ?? 'full_time';
    }
}