/**
 * Formats a numeric value as currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formats a date based on the provided range
 * @param {Date} date - The date to format
 * @param {string} range - The date range ('week', 'month', 'quarter', 'year')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, range) => {
  if (range === 'week') {
    // For week, show day of week (Mon, Tue, etc.)
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else if (range === 'month') {
    // For month, show day and month (May 1, May 2, etc.)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (range === 'quarter') {
    // For quarter, show abbreviated month (Jan, Feb, etc.)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    // For year, show month name (January, February, etc.)
    return date.toLocaleDateString('en-US', { month: 'short' });
  }
};

/**
 * Generates a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer between min and max
 */
export const getRandomValue = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};