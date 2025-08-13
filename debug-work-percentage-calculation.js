// Debug script to verify work percentage calculation
console.log('🔍 Debugging Work Percentage Calculation');

// Simulate the scenario from the screenshot
const clockInTime = '2025-01-13T09:00:00.000Z'; // 9:00 AM
const currentTime = '2025-01-13T11:37:00.000Z'; // 11:37 AM

console.log('📊 Test Scenario:');
console.log('Clock-in time:', new Date(clockInTime).toLocaleTimeString());
console.log('Current time:', new Date(currentTime).toLocaleTimeString());

// Calculate work time elapsed
const actualClockIn = new Date(clockInTime);
const now = new Date(currentTime);

const workTimeElapsedMs = now.getTime() - actualClockIn.getTime();
const workTimeElapsedHours = workTimeElapsedMs / (1000 * 60 * 60);

console.log('⏱️ Work Time Calculation:');
console.log('Elapsed milliseconds:', workTimeElapsedMs);
console.log('Elapsed hours:', workTimeElapsedHours.toFixed(2));

// Standard 8-hour workday
const standardWorkHours = 8;

// Calculate percentage of standard workday completed
const percentage = (workTimeElapsedHours / standardWorkHours) * 100;

console.log('📈 Percentage Calculation:');
console.log('Standard work hours:', standardWorkHours);
console.log('Calculated percentage:', percentage.toFixed(2) + '%');
console.log('Rounded percentage:', Math.round(percentage) + '%');

// Expected result
console.log('✅ Expected Result:');
console.log('Should show approximately 33% of workday');

// Test with different scenarios
console.log('\n🧪 Additional Test Scenarios:');

const testScenarios = [
    { clockIn: '09:00', current: '10:00', expected: 12.5 }, // 1 hour
    { clockIn: '09:00', current: '11:00', expected: 25.0 }, // 2 hours
    { clockIn: '09:00', current: '13:00', expected: 50.0 }, // 4 hours
    { clockIn: '09:00', current: '17:00', expected: 100.0 }, // 8 hours
];

testScenarios.forEach((scenario, index) => {
    const clockIn = new Date(`2025-01-13T${scenario.clockIn}:00.000Z`);
    const current = new Date(`2025-01-13T${scenario.current}:00.000Z`);
    
    const elapsedMs = current.getTime() - clockIn.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const calculatedPercentage = (elapsedHours / 8) * 100;
    
    console.log(`Scenario ${index + 1}: ${scenario.clockIn} → ${scenario.current}`);
    console.log(`  Elapsed: ${elapsedHours}h`);
    console.log(`  Calculated: ${calculatedPercentage.toFixed(1)}%`);
    console.log(`  Expected: ${scenario.expected}%`);
    console.log(`  Match: ${Math.abs(calculatedPercentage - scenario.expected) < 0.1 ? '✅' : '❌'}`);
    console.log('');
});

// Check if there might be timezone issues
console.log('🌍 Timezone Check:');
console.log('Browser timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log('Clock-in parsed:', new Date(clockInTime));
console.log('Current parsed:', new Date(currentTime));