// Debug script to test break time updating
console.log('🔍 Break Time Update Debug Script');

// Function to test break flow and log all data
async function testBreakFlow() {
    console.log('🎭 Testing break flow...');
    
    try {
        // Step 1: Check current status
        console.log('1️⃣ Checking current status...');
        const statusResponse = await fetch('/api/attendance/current');
        const statusData = await statusResponse.json();
        console.log('Current status:', statusData);
        
        if (!statusData.clocked_in) {
            console.log('❌ Not clocked in. Please clock in first.');
            return;
        }
        
        // Step 2: Start break
        console.log('2️⃣ Starting break...');
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
            console.log('✅ Break started successfully:', breakStartData);
            
            // Wait 5 seconds to accumulate some break time
            console.log('⏳ Waiting 5 seconds to accumulate break time...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Step 3: End break
            console.log('3️⃣ Ending break...');
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
                console.log('✅ Break ended successfully:', breakEndData);
                
                // Step 4: Check status after break
                console.log('4️⃣ Checking status after break...');
                const finalStatusResponse = await fetch('/api/attendance/current');
                const finalStatusData = await finalStatusResponse.json();
                console.log('Final status:', finalStatusData);
                
                // Analyze the data
                console.log('📊 Data Analysis:');
                console.log('- Break start response had break_start_time:', !!breakStartData.break_start_time);
                console.log('- Break end response structure:', Object.keys(breakEndData));
                console.log('- Final status break_time:', finalStatusData.todays_summary?.break_time);
                console.log('- Final status current session:', finalStatusData.current_session);
                
                if (finalStatusData.todays_summary?.break_time === '0h 0m') {
                    console.log('🤔 Break time is still 0h 0m after break. Possible issues:');
                    console.log('1. Backend not calculating break time correctly');
                    console.log('2. Break session not being saved properly');
                    console.log('3. Frontend not updating from correct API response field');
                }
                
            } else {
                console.error('❌ Failed to end break:', breakEndResponse.status, await breakEndResponse.text());
            }
        } else {
            console.error('❌ Failed to start break:', breakStartResponse.status, await breakStartResponse.text());
        }
        
    } catch (error) {
        console.error('❌ Error in break flow test:', error);
    }
}

// Function to check what the frontend widget is doing
function checkFrontendBreakTime() {
    console.log('🖥️ Checking frontend break time display...');
    
    // Find the break time element
    const breakTimeElement = document.querySelector('.time-metric:nth-child(2) .time-value');
    if (breakTimeElement) {
        console.log('📊 Current break time display:', breakTimeElement.textContent);
        
        // Check if there's a Vue component instance we can inspect
        const widgetElement = document.querySelector('.attendance-widget');
        if (widgetElement && widgetElement.__vueParentComponent) {
            const vueInstance = widgetElement.__vueParentComponent;
            console.log('Vue component data:', {
                realTimeBreakDuration: vueInstance.setupState?.realTimeBreakDuration?.value,
                todaysSummary: vueInstance.setupState?.attendance?.todaysSummary?.value,
                onBreak: vueInstance.setupState?.attendance?.onBreak?.value,
                breakStartTime: vueInstance.setupState?.breakStartTime?.value
            });
        }
    } else {
        console.log('❌ Break time element not found');
    }
}

// Function to simulate the exact frontend logic
function simulateFrontendLogic() {
    console.log('🔄 Simulating frontend break time calculation...');
    
    // Mock data similar to what the frontend receives
    const mockTodaysSummary = {
        breakTime: '0h 5m' // Simulate 5 minutes of break time
    };
    
    console.log('Testing break time parsing with mock data:', mockTodaysSummary.breakTime);
    
    // Replicate the frontend parsing logic
    const todaysBreakTime = mockTodaysSummary.breakTime || '0h 0m';
    const breakTimeMatch = todaysBreakTime.match(/(\d+)h\s*(\d+)m/);
    
    if (breakTimeMatch) {
        const hours = parseInt(breakTimeMatch[1]);
        const minutes = parseInt(breakTimeMatch[2]);
        const result = `${hours}h ${minutes}m 0s`;
        console.log('✅ Parsed break time successfully:', result);
    } else {
        console.log('❌ Failed to parse break time:', todaysBreakTime);
    }
}

// Make functions available globally
window.testBreakFlow = testBreakFlow;
window.checkFrontendBreakTime = checkFrontendBreakTime;
window.simulateFrontendLogic = simulateFrontendLogic;

// Auto-run checks
console.log('🚀 Break time update debug loaded');
console.log('Available functions:');
console.log('- testBreakFlow() - Test complete break flow');
console.log('- checkFrontendBreakTime() - Check current frontend state');
console.log('- simulateFrontendLogic() - Test parsing logic');

// Run initial checks
checkFrontendBreakTime();
simulateFrontendLogic();