import { computed } from 'vue'

export function useDateUtils() {
  // Format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return ''
    
    const dateObj = new Date(date)
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return ''
    
    // Return in YYYY-MM-DD format
    return dateObj.toISOString().split('T')[0]
  }

  // Format date for display (e.g., "Jan 15, 2024")
  const formatDateForDisplay = (date, options = {}) => {
    if (!date) return '-'
    
    const dateObj = new Date(date)
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '-'
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
    
    return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options })
  }

  // Format date for API (ISO string)
  const formatDateForAPI = (date) => {
    if (!date) return null
    
    const dateObj = new Date(date)
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return null
    
    return dateObj.toISOString()
  }

  // Check if date is in the past
  const isDateInPast = (date) => {
    if (!date) return false
    
    const dateObj = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return dateObj < today
  }

  // Check if date is today
  const isDateToday = (date) => {
    if (!date) return false
    
    const dateObj = new Date(date)
    const today = new Date()
    
    return dateObj.toDateString() === today.toDateString()
  }

  // Get relative date string (e.g., "2 days ago", "in 3 days")
  const getRelativeDateString = (date) => {
    if (!date) return ''
    
    const dateObj = new Date(date)
    const now = new Date()
    const diffTime = dateObj - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0) return `In ${diffDays} days`
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    
    return ''
  }

  // Calculate days between two dates
  const daysBetween = (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const diffTime = end - start
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Get date validation rules
  const getDateValidationRules = (minDate = null, maxDate = null) => {
    return {
      min: minDate ? formatDateForInput(minDate) : null,
      max: maxDate ? formatDateForInput(maxDate) : null
    }
  }

  return {
    formatDateForInput,
    formatDateForDisplay,
    formatDateForAPI,
    isDateInPast,
    isDateToday,
    getRelativeDateString,
    daysBetween,
    getDateValidationRules
  }
}