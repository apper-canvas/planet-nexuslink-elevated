import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getIcon } from '../../utils/iconUtils';
import { DEAL_STAGES } from '../../services/DealsService';

const DealForm = ({ 
  deal = null, 
  onSubmit, 
  onCancel, 
  contacts = [],
  currentUser 
}) => {
  const isEditMode = !!deal;
  
  // Initialize form state
  const [formData, setFormData] = useState({
    title: '',
    contactId: '',
    amount: '',
    stage: 'lead',
    probability: 10,
    expectedCloseDate: '',
    ownerId: currentUser,
    description: '',
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  // Load deal data for editing
  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        contactId: deal.contactId || '',
        amount: deal.amount || '',
        stage: deal.stage || 'lead',
        probability: deal.probability || 10,
        expectedCloseDate: deal.expectedCloseDate || '',
        ownerId: deal.ownerId || currentUser,
        description: deal.description || '',
        tags: deal.tags || []
      });
    }
  }, [deal, currentUser]);

  // Form field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (!formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
    
    setNewTag('');
  };
  
  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Form submission handler with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.contactId) newErrors.contactId = 'Contact is required';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.expectedCloseDate) newErrors.expectedCloseDate = 'Expected close date is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please correct the errors in the form');
      return;
    }
    
    // Submit form
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      probability: Number(formData.probability)
    });
  };

  // Icons
  const XIcon = getIcon('x');
  const PlusIcon = getIcon('plus');
  const UsersIcon = getIcon('users');
  const DollarIcon = getIcon('dollar-sign');
  const CalendarIcon = getIcon('calendar');
  const TargetIcon = getIcon('target');

  return (
    <div className="deal-form">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Deal title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Deal Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="E.g., Annual Software License"
            value={formData.title}
            onChange={handleChange}
            className={`input-field ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        
        {/* Contact selection */}
        <div>
          <label htmlFor="contactId" className="block text-sm font-medium mb-1">
            Associated Contact *
          </label>
          <div className="relative">
            <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
            <select
              id="contactId"
              name="contactId"
              value={formData.contactId}
              onChange={handleChange}
              className={`input-field pl-10 ${errors.contactId ? 'border-red-500 dark:border-red-500' : ''}`}
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </select>
          </div>
          {errors.contactId && <p className="text-red-500 text-xs mt-1">{errors.contactId}</p>}
        </div>
        
        {/* Amount and Stage in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Deal Amount *
            </label>
            <div className="relative">
              <DollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
              <input
                type="number"
                id="amount"
                name="amount"
                min="0"
                placeholder="0"
                value={formData.amount}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.amount ? 'border-red-500 dark:border-red-500' : ''}`}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
          
          <div>
            <label htmlFor="stage" className="block text-sm font-medium mb-1">
              Deal Stage *
            </label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="input-field"
            >
              {DEAL_STAGES.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Close Date and Probability in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expectedCloseDate" className="block text-sm font-medium mb-1">
              Expected Close Date *
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
              <input
                type="date"
                id="expectedCloseDate"
                name="expectedCloseDate"
                value={formData.expectedCloseDate}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.expectedCloseDate ? 'border-red-500 dark:border-red-500' : ''}`}
              />
            </div>
            {errors.expectedCloseDate && <p className="text-red-500 text-xs mt-1">{errors.expectedCloseDate}</p>}
          </div>
          
          <div>
            <label htmlFor="probability" className="block text-sm font-medium mb-1">
              Probability (%)
            </label>
            <div className="relative">
              <TargetIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
              <input
                type="number"
                id="probability"
                name="probability"
                min="0"
                max="100"
                value={formData.probability}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter deal details..."
            className="input-field"
          ></textarea>
        </div>
        
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <div 
                key={tag} 
                className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-primary/70 hover:text-primary"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="input-field rounded-r-none flex-1"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-primary text-white px-3 rounded-r-lg hover:bg-primary-dark transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {isEditMode ? 'Update Deal' : 'Create Deal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DealForm;