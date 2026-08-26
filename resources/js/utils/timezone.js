/**
 * Timezone Utility
 * 
 * Provides consistent timezone handling across the application.
 * All times should be displayed in the admin-configured timezone (America/Chicago)
 * regardless of the user's browser or server timezone.
 */

// Application timezone from backend configuration
export const APP_TIMEZONE = 'America/Chicago';

/**
 * Format a datetime string or Date object to the application timezone
 * @param {string|Date} dateTime - The datetime to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted datetime string
 */
export function formatInAppTimezone(dateTime, options = {}) {
  if (!dateTime) return '';
  
  try {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const defaultOptions = {
      timeZone: APP_TIMEZONE,
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting datetime in app timezone:', error);
    return '';
  }
}

/**
 * Format time only (HH:MM AM/PM) in application timezone
 * @param {string|Date} dateTime - The datetime to format
 * @returns {string} Formatted time string (e.g., "09:04 PM")
 */
export function formatTimeInAppTimezone(dateTime) {
  return formatInAppTimezone(dateTime, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format date only (Month Day, Year) in application timezone
 * @param {string|Date} dateTime - The datetime to format
 * @returns {string} Formatted date string (e.g., "August 14, 2026")
 */
export function formatDateInAppTimezone(dateTime) {
  return formatInAppTimezone(dateTime, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format full datetime in application timezone
 * @param {string|Date} dateTime - The datetime to format
 * @returns {string} Formatted datetime string (e.g., "August 14, 2026, 09:04 PM")
 */
export function formatDateTimeInAppTimezone(dateTime) {
  return formatInAppTimezone(dateTime, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format short datetime in application timezone
 * @param {string|Date} dateTime - The datetime to format
 * @returns {string} Formatted datetime string (e.g., "08/14/2026 09:04 PM")
 */
export function formatShortDateTimeInAppTimezone(dateTime) {
  return formatInAppTimezone(dateTime, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get the current datetime in the application timezone
 * @returns {Date} Current date/time
 */
export function getCurrentTimeInAppTimezone() {
  return new Date();
}

/**
 * Convert a datetime to a string suitable for datetime-local input
 * Format: YYYY-MM-DDTHH:MM
 * @param {string|Date} dateTime - The datetime to convert
 * @returns {string} Formatted string for datetime-local input
 */
export function toDateTimeLocalValue(dateTime) {
  if (!dateTime) return '';
  
  try {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as YYYY-MM-DDTHH:MM in application timezone
    const year = formatInAppTimezone(date, { year: 'numeric', timeZone: APP_TIMEZONE });
    const month = formatInAppTimezone(date, { month: '2-digit', timeZone: APP_TIMEZONE });
    const day = formatInAppTimezone(date, { day: '2-digit', timeZone: APP_TIMEZONE });
    const hour = formatInAppTimezone(date, { hour: '2-digit', hour12: false, timeZone: APP_TIMEZONE });
    const minute = formatInAppTimezone(date, { minute: '2-digit', timeZone: APP_TIMEZONE });
    
    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch (error) {
    console.error('Error converting to datetime-local value:', error);
    return '';
  }
}
