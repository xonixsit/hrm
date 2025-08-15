// Debug script to test break time calculation consistency
// Run this in browser console while on break

console.log('=== Break Time Calculation Debug ===');

// Simulate the main dashboard logic
function calculateMainDashboardBreakTime(currentAttendance, breakStartTime) {
    console.log('Main Dashboard Input:', {
        on_break: currentAttendance.on_break,
        current_break_start: currentAttendance.current_break_start,
        breakStartTime: breakStartTime
    });
    
    if (currentAttendance.on_break) {
        let breakStart = null;
        
        // Try to get break start time from multiple sources
        if (currentAttendance.current_break_start) {
            breakStart = new Date(currentAttendance.current_break_start);
        } else if (breakStartTime) {
            breakStart = new Date(breakStartTime);
        } else if (currentAttendance.break_sessions && currentAttendance.break_sessions.length > 0) {
            // Get the last break session if it doesn't have an end time (ongoing break)
            const lastBreak = currentAttendance.break_sessions[currentAttendance.break_sessions.length - 1];
            if (lastBreak && !lastBreak.end) {
                breakStart = new Date(lastBreak.start);
            }
        }
        
        if (breakStart && !isNaN(breakStart.getTime())) {
            const now = new Date();
            const diffMs = Math.max(0, now - breakStart);
            
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            
            return `${hours}h ${minutes}m ${seconds}s`;
        } else {
            return '0h 0m 1s';
        }
    } else {
        return '0h 0m 0s';
    }
}

// Simulate the floating widget logic
function calculateFloatingWidgetBreakTime(attendance, breakStartTime) {
    console.log('Floating Widget Input:', {
        onBreak: attendance.onBreak,
        breakStartTime: breakStartTime
    });
    
    if (attendance.onBreak && breakStartTime) {
        const breakStart = new Date(breakStartTime);
        if (!isNaN(breakStart.getTime())) {
            const now = new Date();
            const diffMs = Math.max(0, now - breakStart);
            
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            
            return `${hours}h ${minutes}m ${seconds}s`;
        } else {
            return '0h 0m 1s';
        }
    }
    
    return '0h 0m';
}

// Test with sample data
const sampleCurrentAttendance = {
    on_break: true,
    current_break_start: '2025-01-15T12:00:00.000Z', // 1 minute ago
    break_sessions: []
};

const sampleFloatingAttendance = {
    onBreak: true
};

const sampleBreakStartTime = '2025-01-15T12:00:00.000Z'; // Same time

console.log('Main Dashboard Result:', calculateMainDashboardBreakTime(sampleCurrentAttendance, sampleBreakStartTime));
console.log('Floating Widget Result:', calculateFloatingWidgetBreakTime(sampleFloatingAttendance, sampleBreakStartTime));

// Check if they match
const mainResult = calculateMainDashboardBreakTime(sampleCurrentAttendance, sampleBreakStartTime);
const floatingResult = calculateFloatingWidgetBreakTime(sampleFloatingAttendance, sampleBreakStartTime);

if (mainResult === floatingResult) {
    console.log('✅ SYNC: Both calculations match!');
} else {
    console.log('❌ OUT OF SYNC: Different results!');
    console.log('Difference:', { main: mainResult, floating: floatingResult });
}

// Real-time test if on actual page
if (typeof window !== 'undefined' && window.location) {
    console.log('\n=== Real-time Test ===');
    console.log('Run this every few seconds to check sync:');
    console.log(`
    setInterval(() => {
        const mainElement = document.querySelector('[data-testid="main-break-time"]');
        const floatingElement = document.querySelector('[data-testid="floating-break-time"]');
        
        if (mainElement && floatingElement) {
            const mainTime = mainElement.textContent.trim();
            const floatingTime = floatingElement.textContent.trim();
            
            console.log('Real-time check:', {
                main: mainTime,
                floating: floatingTime,
                synced: mainTime === floatingTime
            });
        }
    }, 2000);
    `);
}