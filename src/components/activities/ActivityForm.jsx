import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getIcon } from '../../utils/iconUtils';
import { format } from 'date-fns';
import { getActivityTypes, getActivityStatuses } from '../../utils/activityUtils';

const ActivityForm = ({ activity, onClose, onSave }) => {
  const isEditing = !!activity;
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    type: 'meeting',
    status: 'pending',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    duration: 30,
    location: '',
    relatedTo: {
      type: '',
      id: '',
      name: ''
    },
    assignedTo: '',
    reminder: false,
    reminderTime: '15',
    reminderUnit: 'minutes'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      // Format the date and time for the form inputs
      const activityDate = new Date(activity.date);
      setFormData({
        ...activity,
        date: format(activityDate, 'yyyy-MM-dd'),
        time: activity.time || format(activityDate, 'HH:mm')
      });
    }
  }, [activity]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested property like relatedTo.type
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Combine date and time into a single date object for backend
    const combinedDateTime = new Date(`${formData.date}T${formData.time}`);
    
    try {
      onSave({
        ...formData,
        dateTime: combinedDateTime,
        id: formData.id || crypto.randomUUID()
      });
    } catch (error) {
      console.error('Error saving activity:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save activity. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Icons
  const CloseIcon = getIcon('x');
  const activityTypes = getActivityTypes();
  const activityStatuses = getActivityStatuses();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-surface-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center border-b border-surface-200 dark:border-surface-700 p-4">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Activity' : 'New Activity'}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-60px)]">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {errors.form && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4">
                  {errors.form}
                </div>
              )}
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input-field ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholder="Activity title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {activityTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {activityStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`input-field ${errors.date ? 'border-red-500 dark:border-red-500' : ''}`}
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`input-field ${errors.time ? 'border-red-500 dark:border-red-500' : ''}`}
                  />
                  {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium mb-1">Duration (min)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="5"
                    step="5"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Add details about this activity"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Where will this activity take place?"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reminder"
                  name="reminder"
                  checked={formData.reminder}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 rounded border-surface-300 text-primary focus:ring-primary"
                />
                <label htmlFor="reminder" className="text-sm font-medium">Set reminder</label>
                
                {formData.reminder && (
                  <div className="flex items-center ml-4">
                    <input
                      type="number"
                      name="reminderTime"
                      value={formData.reminderTime}
                      onChange={handleChange}
                      min="1"
                      className="w-16 input-field py-1"
                    />
                    <select
                      name="reminderUnit"
                      value={formData.reminderUnit}
                      onChange={handleChange}
                      className="ml-2 input-field py-1"
                    >
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                    <span className="ml-2 text-sm">before</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditing ? 'Update' : 'Create'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActivityForm;