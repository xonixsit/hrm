// IMMEDIATE FIX - Copy break time from floating widget to main widget
console.log('🚀 IMMEDIATE BREAK TIME FIX - Running now...');

function fixBreakTimeNow() {
    // Find the main widget break time display
    const mainBreakTime = document.querySelector('.time-display-section .time-metric:nth-child(2) .time-value');
    
    if (!mainBreakTime) {
        console.log('❌ Main widget not found');
        return false;
    }
    
    // Find the floating widget break time
    const floatingWidget = document.querySelector('.floating-attendance-widget');
    if (floatingWidget) {
        const floatingBreakTime = floatingWidget.querySelector('.stat:last-child .stat-value');
        if (floatingBreakTime) {
            const breakValue = floatingBreakTime.textContent.trim();
            console.log('📊 Copying break time from floating widget:', breakValue);
            
            // Add seconds if not present
            const breakWithSeconds = breakValue.includes('s') ? breakValue : breakValue + ' 0s';
            
            // Update main widget
            mainBreakTime.textContent = breakWithSeconds;
            console.log('✅ FIXED! Main widget break time updated to:', breakWithSeconds);
            return true;
        }
    }
    
    // Fallback: Get from API directly
    fetch('/api/attendance/current')
        .then(response => response.json())
        .then(data => {
            if (data.todays_summary && data.todays_summary.break_time) {
                const apiBreakTime = data.todays_summary.break_time;
                const breakWithSeconds = apiBreakTime + ' 0s';
                mainBreakTime.textContent = breakWithSeconds;
                console.log('✅ FIXED! Break time from API:', breakWithSeconds);
            }
        });
    
    return true;
}

// Run immediately
fixBreakTimeNow();

// Run every 10 seconds to keep it synced
setInterval(fixBreakTimeNow, 10000);

console.log('✅ Break time fix applied! Main widget should now show correct break time.');
console.log('🔄 Will continue syncing every 10 seconds.');