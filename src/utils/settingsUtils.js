/**
 * Utility functions for settings
 */

/**
 * Available languages for the application
 */
export const availableLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' }
];

/**
 * Available timezones
 */
export const availableTimezones = [
  { code: 'UTC', name: 'UTC (Coordinated Universal Time)' },
  { code: 'America/New_York', name: 'Eastern Time (US & Canada)' },
  { code: 'America/Chicago', name: 'Central Time (US & Canada)' },
  { code: 'America/Denver', name: 'Mountain Time (US & Canada)' },
  { code: 'America/Los_Angeles', name: 'Pacific Time (US & Canada)' },
  { code: 'Europe/London', name: 'London, Edinburgh, Dublin' },
  { code: 'Europe/Paris', name: 'Paris, Madrid, Berlin, Rome' },
  { code: 'Asia/Tokyo', name: 'Tokyo, Seoul, Osaka' },
  { code: 'Asia/Shanghai', name: 'Beijing, Shanghai, Hong Kong' },
  { code: 'Australia/Sydney', name: 'Sydney, Melbourne, Brisbane' }
];

/**
 * Available theme colors
 */
export const themeColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' }
];

/**
 * Available font options
 */
export const fontOptions = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Lato', value: 'Lato' }
];

/**
 * Available border radius options
 */
export const borderRadiusOptions = [
  { name: 'Sharp', value: 'none' },
  { name: 'Slightly Rounded', value: 'small' },
  { name: 'Medium Rounded', value: 'medium' },
  { name: 'Very Rounded', value: 'large' }
];

// Utility to validate email format
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);