<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Console\Command;
use Carbon\Carbon;

class FixMissingEmployeeRecordsFromFile extends Command
{
    protected $signature = 'users:fix-employees {file=user_details.txt}';
    protected $description = 'Create missing employee records for users from file';

    public function handle()
    {
        $filePath = base_path($this->argument('file'));

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $content = file_get_contents($filePath);
        $users = $this->parseUserData($content);

        $defaultDepartment = Department::first();
        if (!$defaultDepartment) {
            $this->error("No departments found.");
            return 1;
        }

        $successCount = 0;
        $errorCount = 0;

        foreach ($users as $userData) {
            try {
                $user = User::where('email', $userData['email'])->first();
                
                if (!$user) {
                    $this->warn("User not found: {$userData['email']}");
                    continue;
                }

                if ($user->employee) {
                    $this->info("Employee record already exists for: {$user->email}");
                    continue;
                }

                $this->info("Creating employee record for: {$user->name}");

                $nameParts = explode(' ', $userData['name']);
                $firstName = $nameParts[0];
                $lastName = implode(' ', array_slice($nameParts, 1));

                // Generate unique employee code
                $employeeCode = 'EMP' . str_pad((Employee::max('id') ?? 0) + 1, 4, '0', STR_PAD_LEFT);

                Employee::create([
                    'user_id' => $user->id,
                    'employee_code' => $employeeCode,
                    'first_name' => $firstName,
                    'last_name' => $lastName ?: $firstName,
                    'email' => $userData['email'],
                    'personal_email' => $userData['personal_email'] ?? null,
                    'phone' => $userData['phone'] ?? null,
                    'emergency_contact' => $userData['emergency_contact'] ?? null,
                    'date_of_birth' => $userData['dob'] ?? null,
                    'address' => $userData['address'] ?? null,
                    'department_id' => $defaultDepartment->id,
                    'hire_date' => now(),
                    'status' => 'active',
                ]);

                $this->info("  ✓ Created successfully");
                $successCount++;

            } catch (\Exception $e) {
                $this->error("  ✗ Error: " . $e->getMessage());
                $errorCount++;
            }
        }

        $this->newLine();
        $this->info("Fix completed!");
        $this->info("Success: {$successCount}");
        $this->info("Errors: {$errorCount}");

        return 0;
    }

    private function parseUserData($content)
    {
        $users = [];
        $blocks = preg_split('/"\s*"/', $content);

        foreach ($blocks as $block) {
            $block = trim($block, " \"\n\r\t");
            if (empty($block)) {
                continue;
            }

            $userData = $this->extractUserInfo($block);
            if ($userData && isset($userData['email'])) {
                $users[] = $userData;
            }
        }

        return $users;
    }

    private function extractUserInfo($block)
    {
        $data = [];

        // Extract name
        if (preg_match('/NAME\s*[:\-]\s*(.+?)(?:\n|$)/i', $block, $matches)) {
            $data['name'] = $this->cleanText($matches[1]);
        } elseif (preg_match('/Name\s*[:\-]\s*(.+?)(?:\n|$)/i', $block, $matches)) {
            $data['name'] = $this->cleanText($matches[1]);
        } elseif (preg_match('/FULL NAME\s*[:\-]\s*(.+?)(?:\n|$)/i', $block, $matches)) {
            $data['name'] = $this->cleanText($matches[1]);
        }

        // Extract email (official)
        if (preg_match('/(?:EMAILID|EMAIL ID|EMAIL ADDRESS|MAIL\.?ID|E-MAIL|OFFICIAL MAIL|OFFICIAL E-MAIL)\s*[:\-;]\s*([^\s\n]+@[^\s\n]+)/i', $block, $matches)) {
            $data['email'] = strtolower(trim($matches[1]));
        }

        // Extract personal email
        if (preg_match('/(?:PERSONAL EMAIL|P\.?EMAIL|Personal mail\.?id|Personal Info)\s*[:\-]\s*([^\s\n]+@[^\s\n]+)/i', $block, $matches)) {
            $data['personal_email'] = strtolower(trim($matches[1]));
        }

        // Extract DOB
        if (preg_match('/(?:DOB|DATE OF BIRTH|D\.O\.B)\s*[:\-]\s*(.+?)(?:\n|$)/i', $block, $matches)) {
            $dobText = $this->cleanText($matches[1]);
            $data['dob'] = $this->parseDOB($dobText);
        }

        // Extract phone
        if (preg_match('/(?:PHONE|PH|CONTACT NUMBER|P\.NO|NUMBER|MOBILE NO)\s*[:\-]\s*([+\d\s\-()]+?)(?:\n|$)/i', $block, $matches)) {
            $data['phone'] = $this->cleanPhone($matches[1]);
        }

        // Extract emergency contact
        if (preg_match('/(?:EMERGENCY|ALTERNATE|ALT|PARENT).*?(?:NUMBER|CONTACT|PH)\s*[:\-]\s*([+\d\s\-()]+?)(?:\n|$)/i', $block, $matches)) {
            $data['emergency_contact'] = $this->cleanPhone($matches[1]);
        }

        // Extract address
        if (preg_match('/(?:ADDRESS|CURRENT ADDRESS)\s*[:\-]\s*(.+?)(?:\n(?:NAME|DOB|EMAIL|PHONE|$))/is', $block, $matches)) {
            $data['address'] = $this->cleanText($matches[1]);
        }

        return $data;
    }

    private function cleanText($text)
    {
        return trim(preg_replace('/\s+/', ' ', $text));
    }

    private function cleanPhone($phone)
    {
        $cleaned = preg_replace('/[^\d+]/', '', $phone);
        return $cleaned;
    }

    private function parseDOB($dobText)
    {
        try {
            $formats = [
                'd-M-Y', 'd-F-Y', 'd/m/Y', 'd-m-Y', 'd M Y', 'd F Y', 'jS F Y', 'd/F/Y',
            ];

            foreach ($formats as $format) {
                $date = Carbon::createFromFormat($format, $dobText);
                if ($date) {
                    return $date->format('Y-m-d');
                }
            }

            return Carbon::parse($dobText)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}
