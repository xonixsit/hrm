// Debug script to check break time display issue
console.log('🔍 Break Time Display Debug Script');

// Function to check current attendance data
async function checkAttendanceData() {
    try {
        console.log('📡 Fetching current attendance status...');
        
        const response = await fetch('/api/attendance/current', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Current attendance data:', data);
            
            // Check break time specifically
            console.log('🔍 Break time analysis:');
            console.log('- Clocked in:', data.clocked_in);
            console.log('- On break:', data.on_break);
            console.log('- Break start time:', data.break_start_time);
            
            if (data.todays_summary) {
                console.log('📊 Today\'s summary:');
                console.log('- Total hours:', data.todays_summary.total_hours);
                console.log('- Break time:', data.todays_summary.break_time);
                console.log('- Sessions:', data.todays_summary.sessions);
            } else {
                console.log('❌ No today\'s summary data found');
            }
            
            if (data.current_session) {
                console.log('📋 Current session data:');
                console.log('- Break sessions:', data.current_session.break_sessions);
                console.log('- Total break minutes:', data.current_session.total_break_minutes);
                console.log('- Current break start:', data.current_session.current_break_start);
            }
            
            // Analyze why break time might be 0
            if (data.todays_summary?.break_time === '0h 0m') {
                console.log('🤔 Break time is 0h 0m - possible reasons:');
                console.log('1. No breaks taken today yet');
                console.log('2. Break sessions not properly saved');
                console.log('3. Break time calculation issue in backend');
                
                if (data.current_session?.break_sessions) {
                    console.log('📝 Break sessions found:', data.current_session.break_sessions);
                } else {
                    console.log('📝 No break sessions in current session');
                }
            }
            
        } else {
            console.error('❌ Failed to fetch attendance data:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Error fetching attendance data:', error);
    }
}

// Function to simulate break and check data
async function simulateBreakFlow() {
    console.log('🎭 Simulating break flow...');
    
    try {
        // Check if clocked in first
        const statusResponse = await fetch('/api/attendance/current');
        const statusData = await statusResponse.json();
        
        if (!statusData.clocked_in) {
            console.log('⚠️ Not clocked in. Please clock in first to test break functionality.');
            return;
        }
        
        console.log('1️⃣ Starting break...');
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
            
            console.log('2️⃣ Ending break...');
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
                
                // Check data after break
                console.log('3️⃣ Checking data after break...');
                await checkAttendanceData();
            } else {
                console.error('❌ Failed to end break:', breakEndResponse.status);
            }
        } else {
            console.error('❌ Failed to start break:', breakStartResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error in break simulation:', error);
    }
}

// Function to check frontend state
function checkFrontendState() {
    console.log('🖥️ Checking frontend state...');
    
    // Try to find the ClockInOutWidget component data
    const widgetElement = document.querySelector('.attendance-widget');
    if (widgetElement) {
        console.log('✅ Found attendance widget element');
        
        // Check if time display section is visible
        const timeDisplaySection = widgetElement.querySelector('.time-display-section');
        if (timeDisplaySection) {
            console.log('✅ Time display section found');
            
            const breakTimeElement = timeDisplaySection.querySelector('.time-metric:nth-child(2) .time-value');
            if (breakTimeElement) {
                console.log('📊 Current break time display:', breakTimeElement.textContent);
            } else {
                console.log('❌ Break time element not found');
            }
        } else {
            console.log('❌ Time display section not found - widget might not be clocked in');
        }
    } else {
        console.log('❌ Attendance widget not found on page');
    }
}

// Main debug function
async function debugBreakTimeDisplay() {
    console.log('🚀 Starting break time display debug...');
    console.log('=====================================');
    
    // Step 1: Check current data
    console.log('Step 1: Check current attendance data');
    await checkAttendanceData();
    
    console.log('\n=====================================');
    
    // Step 2: Check frontend state
    console.log('Step 2: Check frontend state');
    checkFrontendState();
    
    console.log('\n=====================================');
    
    // Step 3: Offer to simulate break
    console.log('Step 3: Break simulation available');
    console.log('Run simulateBreakFlow() to test break functionality');
    
    console.log('\n🔍 Debug complete. Check the logs above for issues.');
}

// Make functions available globally
window.debugBreakTimeDisplay = debugBreakTimeDisplay;
window.simulateBreakFlow = simulateBreakFlow;
window.checkAttendanceData = checkAttendanceData;
window.checkFrontendState = checkFrontendState;

// Auto-run debug
debugBreakTimeDisplay();