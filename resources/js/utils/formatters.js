/**
 * Common formatting utilities used across the application
 */

/**
 * Get initials from a name string
 * @param {string} name - Full name
 * @returns {string} Two-letter initials in uppercase
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Format a date string to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Not provided';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a date and time string
 * @param {string|Date} dateTime - DateTime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return 'Not provided';
  return new Date(dateTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format salary with currency
 * @param {number} salary - Salary amount
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted salary string
 */
export const formatSalary = (salary, currency = 'USD') => {
  if (!salary) return 'Not provided';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(salary);
};

/**
 * Mask account number for security
 * @param {string} accountNumber - Full account number
 * @returns {string} Masked account number
 */
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'Not provided';
  const last4 = accountNumber.slice(-4);
  return `****${last4}`;
};

/**
 * Format gender value
 * @param {string} gender - Gender value
 * @returns {string} Formatted gender string
 */
export const formatGender = (gender) => {
  if (!gender) return 'Not provided';
  const genderMap = {
    'male': 'Male',
    'female': 'Female',
    'other': 'Other',
    'prefer_not_to_say': 'Prefer not to say'
  };
  return genderMap[gender] || gender;
};

/**
 * Format relationship value
 * @param {string} relationship - Relationship value
 * @returns {string} Formatted relationship string
 */
export const formatRelationship = (relationship) => {
  if (!relationship) return 'Not provided';
  const relationshipMap = {
    'spouse': 'Spouse',
    'parent': 'Parent',
    'child': 'Child',
    'sibling': 'Sibling',
    'other': 'Other'
  };
  return relationshipMap[relationship] || relationship;
};

/**
 * Format employment type
 * @param {string} type - Employment type
 * @returns {string} Formatted employment type
 */
export const formatEmploymentType = (type) => {
  if (!type) return 'Full Time';
  const typeMap = {
    'full_time': 'Full Time',
    'part_time': 'Part Time',
    'contract': 'Contract',
    'intern': 'Intern',
    'consultant': 'Consultant'
  };
  return typeMap[type] || type;
};
