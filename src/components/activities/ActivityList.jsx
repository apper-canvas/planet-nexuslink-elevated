import { useState, useMemo } from 'react';
import { getIcon } from '../../utils/iconUtils';
import { format, isToday, isPast, isThisWeek, isThisMonth } from 'date-fns';
import { getActivityTypeIcon, getActivityTypeClass, getActivityStatusClass } from '../../utils/activityUtils';

const ActivityList = ({ activities, loading, onEdit, onDelete }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Icons
  const FilterIcon = getIcon('filter');
  const SearchIcon = getIcon('search');
  const SortAscIcon = getIcon('arrow-up');
  const SortDescIcon = getIcon('arrow-down');
  const EditIcon = getIcon('edit-3');
  const TrashIcon = getIcon('trash-2');
  const CheckIcon = getIcon('check');
  const ClockIcon = getIcon('clock');

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      
      // Filter by type
      if (filterType !== 'all' && activity.type !== filterType) {
        return false;
      }
      
      // Filter by status
      if (filterStatus !== 'all' && activity.status !== filterStatus) {
        return false;
      }
      
      // Filter by date
      if (filterDate === 'today' && !isToday(activityDate)) {
        return false;
      } else if (filterDate === 'thisWeek' && !isThisWeek(activityDate)) {
        return false;
      } else if (filterDate === 'thisMonth' && !isThisMonth(activityDate)) {
        return false;
      } else if (filterDate === 'overdue' && !(isPast(activityDate) && activity.status !== 'completed')) {
        return false;
      }

      // Filter by search query
      if (
        searchQuery &&
        !activity.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      
      return true;
    });
  }, [activities, filterType, filterStatus, filterDate, searchQuery]);

  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'type') {
        return sortOrder === 'asc'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      return 0;
    });
  }, [filteredActivities, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleMarkAsComplete = (id) => {
    // This would be replaced with actual functionality to update the activity
    alert(`Marking activity ${id} as complete - this would call an API in a real implementation`);
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-surface-500 dark:text-surface-400">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
            <SearchIcon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="call">Calls</option>
            <option value="meeting">Meetings</option>
            <option value="task">Tasks</option>
            <option value="email">Emails</option>
            <option value="deadline">Deadlines</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
      
      <div className="border rounded-lg border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="bg-surface-100 dark:bg-surface-800 p-3 grid grid-cols-12 gap-4 text-sm font-medium">
          <div className="col-span-5 sm:col-span-4 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('title')}>
            <span>Activity</span>
            {sortBy === 'title' && (sortOrder === 'asc' ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />)}
          </div>
          <div className="col-span-3 sm:col-span-2 hidden sm:flex items-center gap-2 cursor-pointer" onClick={() => handleSort('type')}>
            <span>Type</span>
            {sortBy === 'type' && (sortOrder === 'asc' ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />)}
          </div>
          <div className="col-span-4 sm:col-span-3 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('date')}>
            <span>Date</span>
            {sortBy === 'date' && (sortOrder === 'asc' ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />)}
          </div>
          <div className="col-span-3 hidden sm:flex items-center gap-2">Status</div>
        </div>
        
        {sortedActivities.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No activities found</h3>
            <p className="text-surface-500 dark:text-surface-400 max-w-md mx-auto">
              {searchQuery 
                ? `No activities match your search "${searchQuery}".` 
                : "Adjust your filters or create a new activity to get started."}
            </p>
          </div>
        ) : (
          sortedActivities.map((activity) => {
            const activityDate = new Date(activity.date);
            const isOverdue = isPast(activityDate) && activity.status !== 'completed';
            const ActivityTypeIcon = getActivityTypeIcon(activity.type);
            const typeClass = getActivityTypeClass(activity.type);
            const statusClass = getActivityStatusClass(activity.status);
            
            return (
              <div key={activity.id} className="activity-list-item grid grid-cols-12 gap-4">
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                  <div className={`activity-icon-container ${typeClass}`}>
                    <ActivityTypeIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{activity.title}</div>
                    {activity.relatedTo && activity.relatedTo.name && (
                      <div className="text-xs text-surface-500 dark:text-surface-400 truncate">
                        {activity.relatedTo.type === 'contact' ? 'Contact' : 'Deal'}: {activity.relatedTo.name}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="col-span-3 sm:col-span-2 hidden sm:flex items-center">
                  <span className="capitalize">{activity.type}</span>
                </div>
                
                <div className="col-span-4 sm:col-span-3 flex flex-col justify-center">
                  <div className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-surface-700 dark:text-surface-300'}>
                    {format(activityDate, 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-surface-500 dark:text-surface-400">
                    {activity.time || format(activityDate, 'h:mm a')}
                  </div>
                </div>
                
                <div className="col-span-3 flex items-center justify-between">
                  <span className={`activity-status-badge ${statusClass}`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                  
                  <div className="flex items-center">
                    {activity.status !== 'completed' && (
                      <button
                        onClick={() => handleMarkAsComplete(activity.id)}
                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        title="Mark as completed"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onEdit(activity.id)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="Edit activity"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(activity.id)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Delete activity"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// For the empty state
const CalendarIcon = getIcon('calendar');

export default ActivityList;