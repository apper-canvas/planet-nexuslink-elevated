import { useState, useMemo } from 'react';
import { getIcon } from '../../utils/iconUtils';
import { 
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  getDay,
  isSameDay
} from 'date-fns';
import { getActivityTypeClass } from '../../utils/activityUtils';

const ActivityCalendar = ({ activities, loading, onSelectActivity }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Icons
  const ChevronLeftIcon = getIcon('chevron-left');
  const ChevronRightIcon = getIcon('chevron-right');
  const CalendarIcon = getIcon('calendar');
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate days of the month
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Group activities by date for quicker lookup
  const activitiesByDate = useMemo(() => {
    const grouped = {};
    
    activities.forEach(activity => {
      const date = activity.date.split('T')[0]; // Get just the date part
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });
    
    return grouped;
  }, [activities]);
  
  // Calculate the day of the week the month starts on (0 = Sunday, 6 = Saturday)
  const startDay = getDay(monthStart);
  
  // Create a grid of days with empty cells at the beginning
  const calendarGrid = [];
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < startDay; i++) {
    calendarGrid.push(null);
  }
  
  // Add days of the month
  days.forEach(day => {
    calendarGrid.push(day);
  });
  
  // Fill out the last row with empty cells if needed
  const totalCells = Math.ceil(calendarGrid.length / 7) * 7;
  for (let i = calendarGrid.length; i < totalCells; i++) {
    calendarGrid.push(null);
  }
  
  // Group the calendar into rows (weeks)
  const calendarRows = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    calendarRows.push(calendarGrid.slice(i, i + 7));
  }
  
  if (loading) {
    return (
      <div className="card flex items-center justify-center p-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-surface-500 dark:text-surface-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Day names */}
        {dayOfWeekNames.map(day => (
          <div key={day} className="p-2 text-center font-medium text-surface-500 dark:text-surface-400">
            {day}
          </div>
        ))}
        
        {/* Calendar cells */}
        {calendarRows.flat().map((day, i) => {
          const dateStr = day ? format(day, 'yyyy-MM-dd') : '';
          const dayActivities = day ? (activitiesByDate[dateStr] || []) : [];
          
          return (
            <div key={i} className={`calendar-day ${isToday(day) ? 'calendar-day-today' : ''}`}>
              {day && (
                <>
                  <div className={`text-sm font-medium ${isToday(day) ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto mb-1' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="overflow-y-auto max-h-[calc(100%-20px)]">
                    {dayActivities.map(activity => (
                      <div
                        key={activity.id}
                        className={`calendar-event ${getActivityTypeClass(activity.type)}`}
                        onClick={() => onSelectActivity(activity.id)}
                      >
                        {activity.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityCalendar;