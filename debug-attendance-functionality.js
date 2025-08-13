// Debug script for testing attendance functionality
// Run this in the browser console when logged into the application

console.log('🔧 Starting Attendance Functionality Debug...');

// Helper function to make API calls with proper headers
async function makeApiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
    
    // Add CSRF token for POST requests
    if (method !== 'GET') {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            options.headers['X-CSRF-TOKEN'] = csrfToken;
        } else {
            console.warn('⚠️ CSRF token not found in meta tag');
        }
    }
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    console.log(`📡 Making ${method} request to ${endpoint}`, options);
    
    try {
        const response = await fetch(endpoint, options);
        const responseData = await response.json();
        
        console.log(`📡 Response from ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            data: responseData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseData.message || 'Unknown error'}`);
        }
        
        return responseData;
    } catch (error) {
        console.error(`❌ API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Test functions
async function testCurrentStatus() {
    console.log('\n🔍 Testing getCurrentStatus...');
    try {
        const data = await makeApiCall('/api/attendance/current');
        console.log('✅ Current status retrieved successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ getCurrentStatus failed:', error);
        return null;
    }
}

async function testClockIn() {
    console.log('\n⏰ Testing Clock In...');
    try {
        const data = await makeApiCall('/api/attendance/clock-in', 'POST', {
            timestamp: new Date().toISOString()
        });
        console.log('✅ Clock in successful:', data);
        return data;
    } catch (error) {
        console.error('❌ Clock in failed:', error);
        return null;
    }
}

async function testClockOut() {
    console.log('\n⏰ Testing Clock Out...');
    try {
        const data = await makeApiCall('/api/attendance/clock-out', 'POST', {
            timestamp: new Date().toISOString()
        });
        console.log('✅ Clock out successful:', data);
        return data;
    } catch (error) {
        console.error('❌ Clock out failed:', error);
        return null;
    }
}

async function testStartBreak() {
    console.log('\n☕ Testing Start Break...');
    try {
        const data = await makeApiCall('/api/attendance/break-start', 'POST', {
            timestamp: new Date().toISOString()
        });
        console.log('✅ Start break successful:', data);
        return data;
    } catch (error) {
        console.error('❌ Start break failed:', error);
        return null;
    }
}

async function testEndBreak() {
    console.log('\n☕ Testing End Break...');
    try {
        const data = await makeApiCall('/api/attendance/break-end', 'POST', {
            timestamp: new Date().toISOString()
        });
        console.log('✅ End break successful:', data);
        return data;
    } catch (error) {
        console.error('❌ End break failed:', error);
        return null;
    }
}

// Comprehensive test sequence
async function runFullTest() {
    console.log('🚀 Starting comprehensive attendance test...\n');
    
    // Step 1: Check initial status
    console.log('📋 Step 1: Check initial status');
    let status = await testCurrentStatus();
    
    if (!status) {
        console.error('❌ Cannot proceed - initial status check failed');
        return;
    }
    
    // Step 2: If clocked out, clock in
    if (!status.clocked_in) {
        console.log('📋 Step 2: Clock in (currently clocked out)');
        const clockInResult = await testClockIn();
        if (!clockInResult) {
            console.error('❌ Cannot proceed - clock in failed');
            return;
        }
        
        // Wait a moment and check status
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await testCurrentStatus();
    } else {
        console.log('📋 Step 2: Already clocked in, skipping clock in test');
    }
    
    // Step 3: Test break functionality if clocked in
    if (status && status.clocked_in) {
        if (!status.on_break) {
            console.log('📋 Step 3: Start break (currently not on break)');
            const breakStartResult = await testStartBreak();
            if (breakStartResult) {
                // Wait a moment
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                console.log('📋 Step 4: End break');
                await testEndBreak();
            }
        } else {
            console.log('📋 Step 3: Currently on break, testing end break');
            await testEndBreak();
        }
    }
    
    // Step 4: Final status check
    console.log('📋 Step 5: Final status check');
    const finalStatus = await testCurrentStatus();
    
    console.log('\n🎯 Test Summary:');
    console.log('================');
    console.log('Initial Status:', status);
    console.log('Final Status:', finalStatus);
    
    if (finalStatus) {
        console.log('✅ All tests completed successfully!');
    } else {
        console.log('❌ Some tests failed - check the logs above');
    }
}

// Individual test functions for manual testing
window.attendanceDebug = {
    testCurrentStatus,
    testClockIn,
    testClockOut,
    testStartBreak,
    testEndBreak,
    runFullTest,
    
    // Quick test functions
    async quickClockIn() {
        console.log('🚀 Quick Clock In Test');
        const status = await testCurrentStatus();
        if (status && !status.clocked_in) {
            return await testClockIn();
        } else {
            console.log('⚠️ Already clocked in or status check failed');
            return null;
        }
    },
    
    async quickClockOut() {
        console.log('🚀 Quick Clock Out Test');
        const status = await testCurrentStatus();
        if (status && status.clocked_in) {
            return await testClockOut();
        } else {
            console.log('⚠️ Not clocked in or status check failed');
            return null;
        }
    },
    
    async quickBreakToggle() {
        console.log('🚀 Quick Break Toggle Test');
        const status = await testCurrentStatus();
        if (status && status.clocked_in) {
            if (status.on_break) {
                return await testEndBreak();
            } else {
                return await testStartBreak();
            }
        } else {
            console.log('⚠️ Not clocked in or status check failed');
            return null;
        }
    }
};

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
    console.log('🎯 Attendance debug functions loaded!');
    console.log('Available functions:');
    console.log('- attendanceDebug.testCurrentStatus()');
    console.log('- attendanceDebug.testClockIn()');
    console.log('- attendanceDebug.testClockOut()');
    console.log('- attendanceDebug.testStartBreak()');
    console.log('- attendanceDebug.testEndBreak()');
    console.log('- attendanceDebug.runFullTest()');
    console.log('- attendanceDebug.quickClockIn()');
    console.log('- attendanceDebug.quickClockOut()');
    console.log('- attendanceDebug.quickBreakToggle()');
    console.log('\n💡 Run attendanceDebug.runFullTest() to test everything automatically');
    
    // Auto-run initial status check
    testCurrentStatus();
} else {
    // If running in Node.js, just run the full test
    runFullTest();
}