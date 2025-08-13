/**
 * Debug script to test attendance API endpoints
 * Run this in the browser console on the dashboard page
 */

console.log('🔍 Starting attendance API debug...');

// Check if CSRF token exists
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
console.log('CSRF Token:', csrfToken ? 'Found ✅' : 'Missing ❌');

if (!csrfToken) {
    console.error('❌ CSRF token is missing! This will cause API calls to fail.');
    console.log('💡 Solution: Make sure <meta name="csrf-token" content="{{ csrf_token() }}"> is in app.blade.php');
} else {
    console.log('✅ CSRF token found:', csrfToken.substring(0, 10) + '...');
}

// Test current attendance status
async function testCurrentStatus() {
    console.log('\n📊 Testing current attendance status...');
    
    try {
        const response = await fetch('/api/attendance/current', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });
        
        console.log('Current status response:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Current attendance data:', data);
            
            console.log('📋 Summary:');
            console.log('- Clocked In:', data.clocked_in);
            console.log('- On Break:', data.on_break);
            console.log('- Clock In Time:', data.clock_in_time);
            console.log('- Today\'s Hours:', data.todays_summary?.total_hours);
            
            return data;
        } else {
            const errorText = await response.text();
            console.error('❌ Current status failed:', errorText);
            return null;
        }
    } catch (error) {
        console.error('❌ Current status error:', error);
        return null;
    }
}

// Test clock in
async function testClockIn() {
    console.log('\n🟢 Testing clock in...');
    
    try {
        const response = await fetch('/api/attendance/clock-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString()
            })
        });
        
        console.log('Clock in response:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Clock in successful:', data);
            return data;
        } else {
            const errorText = await response.text();
            console.error('❌ Clock in failed:', errorText);
            return null;
        }
    } catch (error) {
        console.error('❌ Clock in error:', error);
        return null;
    }
}

// Test clock out
async function testClockOut() {
    console.log('\n🔴 Testing clock out...');
    
    try {
        const response = await fetch('/api/attendance/clock-out', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString()
            })
        });
        
        console.log('Clock out response:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Clock out successful:', data);
            return data;
        } else {
            const errorText = await response.text();
            console.error('❌ Clock out failed:', errorText);
            return null;
        }
    } catch (error) {
        console.error('❌ Clock out error:', error);
        return null;
    }
}

// Run the tests
async function runTests() {
    console.log('🚀 Running attendance API tests...\n');
    
    // Test 1: Check current status
    const currentStatus = await testCurrentStatus();
    
    if (!currentStatus) {
        console.error('❌ Cannot proceed - current status API failed');
        return;
    }
    
    // Test 2: Try clock in if not already clocked in
    if (!currentStatus.clocked_in) {
        console.log('\n👤 User is clocked out, testing clock in...');
        const clockInResult = await testClockIn();
        
        if (clockInResult) {
            console.log('✅ Clock in test passed!');
            
            // Wait a moment then check status again
            setTimeout(async () => {
                console.log('\n🔄 Checking status after clock in...');
                await testCurrentStatus();
            }, 1000);
        }
    } else {
        console.log('\n👤 User is already clocked in');
        console.log('💡 You can test clock out by running: testClockOut()');
    }
    
    console.log('\n✅ API tests completed!');
    console.log('💡 Available functions:');
    console.log('- testCurrentStatus()');
    console.log('- testClockIn()');
    console.log('- testClockOut()');
}

// Make functions available globally for manual testing
window.testCurrentStatus = testCurrentStatus;
window.testClockIn = testClockIn;
window.testClockOut = testClockOut;

// Run tests automatically
runTests();