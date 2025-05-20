import { getIcon } from './iconUtils';

// Get activity types for dropdown options
export const getActivityTypes = () => [
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'email', label: 'Email' },
  { value: 'deadline', label: 'Deadline' }
];

// Get activity statuses for dropdown options
export const getActivityStatuses = () => [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Get icon component for activity type
export const getActivityTypeIcon = (type) => {
  switch (type) {
    case 'call':
      return getIcon('phone');
    case 'meeting':
      return getIcon('users');
    case 'task':
      return getIcon('check-square');
    case 'email':
      return getIcon('mail');
    case 'deadline':
      return getIcon('alert-circle');
    default:
      return getIcon('calendar');
  }
};

// Get CSS class for activity type (used for icon background)
export const getActivityTypeClass = (type) => {
  switch (type) {
    case 'call':
      return 'activity-type-call';
    case 'meeting':
      return 'activity-type-meeting';
    case 'task':
      return 'activity-type-task';
    case 'email':
      return 'activity-type-email';
    case 'deadline':
      return 'activity-type-deadline';
    default:
      return '';
  }
};

// Get CSS class for activity status
export const getActivityStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'activity-status-completed';
    case 'pending':
      return 'activity-status-pending';
    case 'cancelled':
      return 'activity-status-overdue';
    default:
      return '';
  }
};

// Generate reminder text
export const getReminderText = (reminderTime, reminderUnit) => {
  return `${reminderTime} ${reminderUnit} before`;
};