import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { getActivityTypes, getActivityStatuses } from '../../utils/activityUtils';
import { format } from 'date-fns';
import ActivityList from './ActivityList';
import ActivityCalendar from './ActivityCalendar';
import ActivityForm from './ActivityForm';
import { getAllActivities, getActivityById, saveActivity, deleteActivity } from '../../services/ActivityService';

const ActivitiesModule = ({ darkMode, currentUser }) => {
  const [activities, setActivities] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [loading, setLoading] = useState(true);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  // Activity type and status information
  const activityTypes = getActivityTypes();
  const activityStatuses = getActivityStatuses();

  // Icons
  const ListIcon = getIcon('list');
  const CalendarIcon = getIcon('calendar');
  const PlusIcon = getIcon('plus');
  const FilterIcon = getIcon('filter');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await getAllActivities();
      setActivities(data);
    } catch (error) {
      toast.error('Failed to load activities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = () => {
    setCurrentActivity(null);
    setActivityFormOpen(true);
  };

  const handleEditActivity = async (id) => {
    try {
      const activity = await getActivityById(id);
      setCurrentActivity(activity);
      setActivityFormOpen(true);
    } catch (error) {
      toast.error('Failed to load activity details');
      console.error(error);
    }
  };

  const handleSaveActivity = async (activityData) => {
    try {
      await saveActivity(activityData);
      setActivityFormOpen(false);
      toast.success(currentActivity ? 'Activity updated' : 'Activity created');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to save activity');
      console.error(error);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivity(id);
        toast.success('Activity deleted');
        fetchActivities();
      } catch (error) {
        toast.error('Failed to delete activity');
        console.error(error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <div className="flex items-center gap-2">
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700 flex">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 flex items-center gap-2 rounded-l-lg ${view === 'list' ? 'bg-primary/10 text-primary dark:bg-primary/20' : ''}`}
            >
              <ListIcon className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 flex items-center gap-2 rounded-r-lg ${view === 'calendar' ? 'bg-primary/10 text-primary dark:bg-primary/20' : ''}`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>
          <button
            onClick={handleAddActivity}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Activity</span>
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <ActivityList 
          activities={activities} 
          loading={loading}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
          activityTypes={activityTypes}
          activityStatuses={activityStatuses}
          typeInfo={activityTypes}
          filterType={filterType}
        />
      ) : (
        <ActivityCalendar activities={activities} loading={loading} onSelectActivity={handleEditActivity} />
      )}

      {activityFormOpen && <ActivityForm activity={currentActivity} onClose={() => setActivityFormOpen(false)} onSave={handleSaveActivity} />}
    </motion.div>
  );
};

export default ActivitiesModule;