import { useState } from 'react';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { updateSettings } from '../../services/SettingsService';
import { availableLanguages, availableTimezones, isValidEmail } from '../../utils/settingsUtils';

const AccountSettings = ({ settings, setSettings }) => {
  const [formData, setFormData] = useState({ ...settings.account });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(settings.account.avatar);

  // Icons
  const UserIcon = getIcon('user');
  const UploadIcon = getIcon('upload');
  const GlobeIcon = getIcon('globe');
  const ClockIcon = getIcon('clock');
  const KeyIcon = getIcon('key');
  const LogOutIcon = getIcon('log-out');
  const CheckIcon = getIcon('check');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
      setFormData({
        ...formData,
        avatar: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      toast.error('Valid email is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      const updatedSettings = updateSettings('account', formData);
      setSettings(updatedSettings);
      toast.success('Account settings updated successfully');
    } catch (error) {
      toast.error('Failed to update account settings');
      console.error('Error updating account settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="settings-card">
        <h2 className="settings-section-title">Profile Information</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-surface-400" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg"
              >
                <UploadIcon className="w-4 h-4" />
              </label>
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h3 className="font-medium">{formData.name || 'User Name'}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">{formData.role || 'Admin'}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">{formData.email || 'user@example.com'}</p>
            </div>
          </div>
          
          {/* Basic Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleInputChange}
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email || ''} 
                onChange={handleInputChange}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>
          </div>
          
          {/* Language and Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-1 flex items-center gap-1">
                <GlobeIcon className="w-4 h-4" /> Language
              </label>
              <select 
                id="language" 
                name="language" 
                value={formData.language || 'en-US'} 
                onChange={handleInputChange}
                className="input-field"
              >
                {availableLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium mb-1 flex items-center gap-1">
                <ClockIcon className="w-4 h-4" /> Timezone
              </label>
              <select 
                id="timezone" 
                name="timezone" 
                value={formData.timezone || 'UTC'} 
                onChange={handleInputChange}
                className="input-field"
              >
                {availableTimezones.map(tz => (
                  <option key={tz.code} value={tz.code}>{tz.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <KeyIcon className="w-5 h-5" /> Security
        </h2>
        <div className="space-y-4">
          <button className="btn-secondary w-full md:w-auto">Change Password</button>
          <button className="btn-secondary w-full md:w-auto ml-0 md:ml-2">Enable Two-Factor Authentication</button>
        </div>
      </div>
      
      <div className="settings-card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50">
        <h2 className="settings-section-title text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50 flex items-center gap-2">
          <LogOutIcon className="w-5 h-5" /> Account Actions
        </h2>
        <div className="space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            These actions are permanent and cannot be undone. Please proceed with caution.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button className="btn-secondary border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-400">
              Log Out From All Devices
            </button>
            <button className="btn-secondary border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-400">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;