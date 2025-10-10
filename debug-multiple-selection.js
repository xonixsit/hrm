// Debug script to test multiple employee selection logic

// Simulate the form data structure
const form = {
    employee_ids: [], // This should be an array
    competency_id: null,
    assessment_type: 'manager',
    assessment_cycle_id: null
};

// Sample employees
const employees = [
    { id: 1, name: 'John Doe', position: 'Software Engineer' },
    { id: 2, name: 'Jane Smith', position: 'Product Manager' },
    { id: 3, name: 'Mike Johnson', position: 'Designer' }
];

// Test the selection logic
function selectEmployee(employee) {
    console.log('Selecting employee:', employee.name);
    console.log('Current employee_ids before:', form.employee_ids);
    
    const index = form.employee_ids.indexOf(employee.id);
    if (index > -1) {
        // Employee already selected, remove them
        form.employee_ids.splice(index, 1);
        console.log('Removed employee:', employee.name);
    } else {
        // Employee not selected, add them
        form.employee_ids.push(employee.id);
        console.log('Added employee:', employee.name);
    }
    
    console.log('Current employee_ids after:', form.employee_ids);
    console.log('Selected count:', form.employee_ids.length);
    console.log('---');
}

// Test selecting multiple employees
console.log('=== Testing Multiple Employee Selection ===');
selectEmployee(employees[0]); // Select John
selectEmployee(employees[1]); // Select Jane
selectEmployee(employees[2]); // Select Mike
selectEmployee(employees[0]); // Deselect John
selectEmployee(employees[1]); // Deselect Jane

console.log('Final state:', form);
console.log('Final selected count:', form.employee_ids.length);

// Test the computed property logic
function getSelectedEmployees() {
    return employees.filter(e => form.employee_ids.includes(e.id));
}

console.log('Selected employees:', getSelectedEmployees());