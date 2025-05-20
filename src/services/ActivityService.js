import { format, addDays, subDays } from 'date-fns';

// In-memory storage for activities
let activities = [
  {
    id: '1',
    title: 'Call with John Smith',
    type: 'call',
    status: 'pending',
    description: 'Follow up about the new project proposal',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:30',
    duration: 30,
    location: 'Phone',
    relatedTo: {
      type: 'contact',
      id: '1',
      name: 'John Smith'
    },
    assignedTo: 'Current User',
    reminder: true,
    reminderTime: '15',
    reminderUnit: 'minutes'
  },
  {
    id: '2',
    title: 'Meeting with Design Team',
    type: 'meeting',
    status: 'completed',
    description: 'Review wireframes for the new dashboard',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '14:00',
    duration: 60,
    location: 'Conference Room B',
    relatedTo: {
      type: 'deal',
      id: '2',
      name: 'Website Redesign Project'
    },
    assignedTo: 'Current User',
    reminder: false
  },
  {
    id: '3',
    title: 'Send proposal to ABC Corp',
    type: 'email',
    status: 'pending',
    description: 'Send updated proposal with revised pricing',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 15,
    location: '',
    relatedTo: {
      type: 'contact',
      id: '3',
      name: 'ABC Corp'
    },
    assignedTo: 'Current User',
    reminder: true,
    reminderTime: '1',
    reminderUnit: 'hours'
  },
  {
    id: '4',
    title: 'Prepare quarterly report',
    type: 'task',
    status: 'pending',
    description: 'Compile Q3 sales figures and create presentation',
    date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    time: '12:00',
    duration: 120,
    location: '',
    relatedTo: {
      type: 'deal',
      id: '4',
      name: 'Q3 Review'
    },
    assignedTo: 'Current User',
    reminder: true,
    reminderTime: '1',
    reminderUnit: 'days'
  },
  {
    id: '5',
    title: 'Project deadline',
    type: 'deadline',
    status: 'pending',
    description: 'Final delivery of the marketing automation project',
    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    time: '18:00',
    duration: 0,
    location: '',
    relatedTo: {
      type: 'deal',
      id: '5', 
      name: 'Marketing Automation'
    },
    assignedTo: 'Current User',
    reminder: true,
    reminderTime: '2',
    reminderUnit: 'days'
  }
];

// Get all activities
export const getAllActivities = () => {
  return Promise.resolve([...activities]);
};

// Get activity by ID
export const getActivityById = (id) => {
  const activity = activities.find(a => a.id === id);
  return Promise.resolve(activity ? { ...activity } : null);
};

// Save activity (create or update)
export const saveActivity = (activity) => {
  if (activities.some(a => a.id === activity.id)) {
    // Update existing
    activities = activities.map(a => a.id === activity.id ? { ...activity } : a);
  } else {
    // Create new
    activities.push({ ...activity });
  }
  return Promise.resolve({ ...activity });
};

// Delete activity
export const deleteActivity = (id) => {
  activities = activities.filter(a => a.id !== id);
  return Promise.resolve({ success: true });
};

// Get activities by contact or deal ID
export const getActivitiesByRelated = (type, id) => {
  const filtered = activities.filter(
    a => a.relatedTo?.type === type && a.relatedTo?.id === id
  );
  return Promise.resolve([...filtered]);
};