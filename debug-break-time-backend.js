// Debug script to check backend break time data
console.log('🔍 Backend Break Time Debug Script');

async function debugBackendBreakTime() {
    console.log('🚀 Starting backend break time diagnosis...');
    console.log('=====================================');
    
    try {
        // Step 1: Check current attendance status
        console.log('1️⃣ Fetching current attendance status...');
        const response = await fetch('/api/attendance/current', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:', data);
            
            // Analyze the response structure
            console.log('\n📊 Response Analysis:');
            console.log('- Clocked in:', data.clocked_in);
            console.log('- On break:', data.on_break);
            console.log('- Clock in time:', data.clock_in_time);
            console.log('- Break start time:', data.break_start_time);
            
            // Check today's summary
            if (data.todays_summary) {
                console.log('\n📋 Today\'s Summary:');
                console.log('- Total hours:', data.todays_summary.total_hours);
                console.log('- Break time:', data.todays_summary.break_time);
                console.log('- Sessions:', data.todays_summary.sessions);
                console.log('- Clock ins:', data.todays_summary.clock_ins);
                
                // This is the key issue - check if break_time is always 0h 0m
                if (data.todays_summary.break_time === '0h 0m') {
                    console.log('🚨 ISSUE FOUND: break_time is 0h 0m');
                    console.log('This means the backend is not calculating break time correctly');
                }
            } else {
                console.log('❌ No todays_summary in response');
            }
            
            // Check current session data
            if (data.current_session) {
                console.log('\n📝 Current Session:');
                console.log('- Break sessions:', data.current_session.break_sessions);
                console.log('- Total break minutes:', data.current_session.total_break_minutes);
                console.log('- Current break start:', data.current_session.current_break_start);
                console.log('- On break flag:', data.current_session.on_break);
                
                // Check if break sessions exist but break_time is still 0
                if (data.current_session.break_sessions && 
                    data.current_session.break_sessions.length > 0 && 
                    data.todays_summary?.break_time === '0h 0m') {
                    console.log('🚨 BACKEND BUG CONFIRMED:');
                    console.log('- Break sessions exist in database');
                    console.log('- But break_time calculation is returning 0h 0m');
                    console.log('- This is a backend Attendance model issue');
                }
            }
            
            return data;
        } else {
            console.error('❌ API request failed:', response.status, response.statusText);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
}

async function testBreakFlow() {
    console.log('\n🧪 Testing break flow to identify backend issue...');
    
    try {
        // Check if clocked in
        const statusResponse = await fetch('/api/attendance/current');
        const statusData = await statusResponse.json();
        
        if (!statusData.clocked_in) {
            console.log('❌ Not clocked in. Please clock in first to test break flow.');
            return;
        }
        
        console.log('✅ Currently clocked in. Testing break flow...');
        
        // Start break
        console.log('\n2️⃣ Starting break...');
        const breakStartResponse = await fetch('/api/attendance/break-start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString()
            })
        });
        
        if (breakStartResponse.ok) {
            const breakStartData = await breakStartResponse.json();
            console.log('✅ Break started:', breakStartData);
            
            // Wait 3 seconds
            console.log('⏳ Waiting 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // End break
            console.log('\n3️⃣ Ending break...');
            const breakEndResponse = await fetch('/api/attendance/break-end', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString()
                })
            });
            
            if (breakEndResponse.ok) {
                const breakEndData = await breakEndResponse.json();
                console.log('✅ Break ended:', breakEndData);
                
                // Check what the break end response contains
                console.log('\n📊 Break End Response Analysis:');
                console.log('- Response keys:', Object.keys(breakEndData));
                console.log('- Has attendance object:', !!breakEndData.attendance);
                console.log('- Has break_duration:', !!breakEndData.break_duration);
                
                if (breakEndData.attendance) {
                    console.log('- Attendance break_duration:', breakEndData.attendance.break_duration);
                }
                
                // Check status after break
                console.log('\n4️⃣ Checking status after break...');
                const finalData = await debugBackendBreakTime();
                
                // Final analysis
                console.log('\n🔍 FINAL DIAGNOSIS:');
                if (finalData && finalData.todays_summary?.break_time === '0h 0m') {
                    console.log('🚨 CONFIRMED: Backend break time calculation is broken');
                    console.log('📋 Evidence:');
                    console.log('1. Break was started and ended successfully');
                    console.log('2. Break sessions should be recorded in database');
                    console.log('3. But todays_summary.break_time is still 0h 0m');
                    console.log('4. Issue is in Laravel Attendance model getBreakDurationAttribute()');
                    
                    console.log('\n🔧 SOLUTION NEEDED:');
                    console.log('Fix the backend Attendance model break time calculation');
                    console.log('Check app/Models/Attendance.php getBreakDurationAttribute() method');
                } else if (finalData && finalData.todays_summary?.break_time !== '0h 0m') {
                    console.log('✅ Backend is working correctly');
                    console.log('Issue might be in frontend data handling');
                }
                
            } else {
                console.error('❌ Failed to end break:', breakEndResponse.status);
            }
        } else {
            console.error('❌ Failed to start break:', breakStartResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error in break flow test:', error);
    }
}

// Make functions available globally
window.debugBackendBreakTime = debugBackendBreakTime;
window.testBreakFlow = testBreakFlow;

// Auto-run diagnosis
console.log('🎯 Available functions:');
console.log('- debugBackendBreakTime() - Check current backend data');
console.log('- testBreakFlow() - Test complete break flow');
console.log('\nRunning initial diagnosis...');

debugBackendBreakTime().then(() => {
    console.log('\n💡 If break_time is 0h 0m but you\'ve taken breaks, run testBreakFlow() to confirm backend issue');
});