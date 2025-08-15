// Simple fix to sync main widget with floating widget
console.log('🔧 Applying direct break time fix...');

// Function to force update the main widget break time display
function forceUpdateMainWidgetBreakTime() {
    console.log('🎯 Forcing main widget break time update...');
    
    // Find the main widget break time element
    const mainWidgetBreakTime = document.querySelector('.time-display-section .time-metric:nth-child(2) .time-value');
    
    if (mainWidgetBreakTime) {
        console.log('✅ Found main widget break time element:', mainWidgetBreakTime.textContent);
        
        // Find the floating widget break time element
        const floatingWidget = document.querySelector('.floating-attendance-widget');
        
        if (floatingWidget) {
            // Try to get break time from floating widget
            const floatingBreakTime = floatingWidget.querySelector('.stat:nth-child(2) .stat-value');
            
            if (floatingBreakTime) {
                const floatingBreakValue = floatingBreakTime.textContent;
                console.log('📊 Floating widget break time:', floatingBreakValue);
                
                // Convert to seconds format for consistency
                const breakTimeWithSeconds = floatingBreakValue.includes('h') && floatingBreakValue.includes('m') 
                    ? floatingBreakValue.replace(/(\d+h \d+m)/, '$1 0s')
                    : floatingBreakValue;
                
                // Update main widget display
                mainWidgetBreakTime.textContent = breakTimeWithSeconds;
                console.log('✅ Updated main widget break time to:', breakTimeWithSeconds);
                
                return true;
            }
        }
        
        // Fallback: Get break time directly from API
        fetch('/api/attendance/current')
            .then(response => response.json())
            .then(data => {
                console.log('📡 API data:', data);
                
                if (data.todays_summary && data.todays_summary.break_time) {
                    const apiBreakTime = data.todays_summary.break_time;
                    console.log('📊 API break time:', apiBreakTime);
                    
                    // Convert to seconds format
                    const breakTimeWithSeconds = apiBreakTime.includes('h') && apiBreakTime.includes('m') 
                        ? apiBreakTime + ' 0s'
                        : apiBreakTime;
                    
                    // Update main widget display
                    mainWidgetBreakTime.textContent = breakTimeWithSeconds;
                    console.log('✅ Updated main widget break time from API to:', breakTimeWithSeconds);
                } else {
                    console.log('❌ No break time found in API response');
                }
            })
            .catch(error => {
                console.error('❌ API error:', error);
            });
        
        return true;
    } else {
        console.log('❌ Main widget break time element not found');
        return false;
    }
}

// Function to continuously sync the widgets
function startBreakTimeSync() {
    console.log('🔄 Starting break time sync...');
    
    // Update immediately
    forceUpdateMainWidgetBreakTime();
    
    // Update every 5 seconds
    const syncInterval = setInterval(() => {
        forceUpdateMainWidgetBreakTime();
    }, 5000);
    
    console.log('✅ Break time sync started (updating every 5 seconds)');
    
    // Return function to stop sync
    return () => {
        clearInterval(syncInterval);
        console.log('🛑 Break time sync stopped');
    };
}

// Function to check current state
function checkCurrentState() {
    console.log('🔍 Checking current widget states...');
    
    // Check main widget
    const mainWidgetBreakTime = document.querySelector('.time-display-section .time-metric:nth-child(2) .time-value');
    const mainWidgetWorkTime = document.querySelector('.time-display-section .time-metric:nth-child(1) .time-value');
    
    if (mainWidgetBreakTime && mainWidgetWorkTime) {
        console.log('📊 Main Widget:');
        console.log('  - Work Time:', mainWidgetWorkTime.textContent);
        console.log('  - Break Time:', mainWidgetBreakTime.textContent);
    } else {
        console.log('❌ Main widget time elements not found');
    }
    
    // Check floating widget
    const floatingWidget = document.querySelector('.floating-attendance-widget');
    if (floatingWidget) {
        const floatingWorkTime = floatingWidget.querySelector('.stat:nth-child(1) .stat-value');
        const floatingBreakTime = floatingWidget.querySelector('.stat:nth-child(2) .stat-value');
        
        if (floatingWorkTime && floatingBreakTime) {
            console.log('📊 Floating Widget:');
            console.log('  - Work Time:', floatingWorkTime.textContent);
            console.log('  - Break Time:', floatingBreakTime.textContent);
        }
    } else {
        console.log('❌ Floating widget not found');
    }
    
    // Check API data
    fetch('/api/attendance/current')
        .then(response => response.json())
        .then(data => {
            console.log('📊 API Data:');
            console.log('  - Break Time:', data.todays_summary?.break_time || 'Not found');
            console.log('  - Total Hours:', data.todays_summary?.total_hours || 'Not found');
            console.log('  - On Break:', data.on_break ? 'Yes' : 'No');
        })
        .catch(error => {
            console.error('❌ API check failed:', error);
        });
}

// Make functions available globally
window.forceUpdateMainWidgetBreakTime = forceUpdateMainWidgetBreakTime;
window.startBreakTimeSync = startBreakTimeSync;
window.checkCurrentState = checkCurrentState;

// Auto-run
console.log('🚀 Break time fix script loaded');
console.log('Available functions:');
console.log('- forceUpdateMainWidgetBreakTime() - Force update once');
console.log('- startBreakTimeSync() - Start continuous sync');
console.log('- checkCurrentState() - Check current state');

// Check current state first
checkCurrentState();

// Auto-start sync after 2 seconds
setTimeout(() => {
    console.log('🔄 Auto-starting break time sync...');
    startBreakTimeSync();
}, 2000);