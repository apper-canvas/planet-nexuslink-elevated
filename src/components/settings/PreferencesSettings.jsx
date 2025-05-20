import { useState } from 'react';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { updateSettings } from '../../services/SettingsService';

const PreferencesSettings = ({ settings, setSettings }) => {
  const [notifications, setNotifications] = useState({ ...settings.preferences.notifications });
  const [display, setDisplay] = useState({ ...settings.preferences.display });
  const [isSaving, setIsSaving] = useState(false);

  // Icons
  const BellIcon = getIcon('bell');
  const MailIcon = getIcon('mail');
  const DesktopIcon = getIcon('monitor');
  const MobileIcon = getIcon('smartphone');
  const DollarSignIcon = getIcon('dollar-sign');
  const CalendarIcon = getIcon('calendar');
  const AtSignIcon = getIcon('at-sign');
  const InfoIcon = getIcon('info');
  const LayoutIcon = getIcon('layout');
  const TagIcon = getIcon('tag');
  const HomeIcon = getIcon('home');
  const ListIcon = getIcon('list');
  const SaveIcon = getIcon('save');

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({
      ...notifications,
      [name]: checked
    });
  };

  const handleDisplayChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDisplay({
      ...display,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const savePreferences = async (section) => {
    setIsSaving(true);
    try {
      let updatedSettings;
      
      if (section === 'notifications') {
        updatedSettings = updateSettings('preferences', { 
          ...settings.preferences, 
          notifications 
        });
        toast.success('Notification preferences saved');
      } else if (section === 'display') {
        updatedSettings = updateSettings('preferences', { 
          ...settings.preferences, 
          display 
        });
        toast.success('Display preferences saved');
      } else {
        updatedSettings = updateSettings('preferences', { 
          notifications,
          display
        });
        toast.success('All preferences saved');
      }
      
      setSettings(updatedSettings);
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const NotificationToggle = ({ icon: Icon, label, name, description }) => (
    <div className="flex items-start justify-between py-3 border-b border-surface-200 dark:border-surface-700 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 flex-shrink-0 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-sm text-surface-500 dark:text-surface-400">{description}</div>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input 
          type="checkbox" 
          name={name} 
          checked={notifications[name] || false} 
          onChange={handleNotificationChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-surface-300 dark:bg-surface-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <BellIcon className="w-5 h-5" /> Notification Preferences
        </h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3">Notification Channels</h3>
          <div className="space-y-1">
            <NotificationToggle 
              icon={MailIcon} 
              label="Email Notifications" 
              name="email" 
              description="Receive notifications via email"
            />
            <NotificationToggle 
              icon={DesktopIcon} 
              label="Browser Notifications" 
              name="browser" 
              description="Show desktop notifications in your browser"
            />
            <NotificationToggle 
              icon={MobileIcon} 
              label="Mobile Notifications" 
              name="mobile" 
              description="Receive push notifications on your mobile device" 
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3">Notification Types</h3>
          <div className="space-y-1">
            <NotificationToggle 
              icon={DollarSignIcon} 
              label="Deal Updates" 
              name="deals" 
              description="Get notified about deal status changes and updates"
            />
            <NotificationToggle 
              icon={CalendarIcon} 
              label="Activity Reminders" 
              name="activities" 
              description="Receive reminders about upcoming tasks and activities"
            />
            <NotificationToggle 
              icon={AtSignIcon} 
              label="Mentions" 
              name="mentions" 
              description="Get notified when someone mentions you in notes or comments"
            />
            <NotificationToggle 
              icon={InfoIcon} 
              label="System Updates" 
              name="system" 
              description="Receive notifications about system updates and maintenance"
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <button 
            onClick={() => savePreferences('notifications')} 
            className="btn-primary flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (
              <>
                <SaveIcon className="w-4 h-4" />
                Save Notification Settings
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <LayoutIcon className="w-5 h-5" /> Display Preferences
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex-shrink-0 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                <LayoutIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Compact View</div>
                <div className="text-sm text-surface-500 dark:text-surface-400">Display more items per page with a compact layout</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input 
                type="checkbox" 
                name="compactView" 
                checked={display.compactView || false} 
                onChange={handleDisplayChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-300 dark:bg-surface-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex-shrink-0 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Show Tags</div>
                <div className="text-sm text-surface-500 dark:text-surface-400">Display tags in contact and deal lists</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input 
                type="checkbox" 
                name="showTags" 
                checked={display.showTags || false} 
                onChange={handleDisplayChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-300 dark:bg-surface-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <HomeIcon className="w-4 h-4" /> Default Home Tab
              </label>
              <select 
                name="defaultTab" 
                value={display.defaultTab || 'contacts'} 
                onChange={handleDisplayChange}
                className="input-field"
              >
                <option value="contacts">Contacts</option>
                <option value="deals">Deals</option>
                <option value="activities">Activities</option>
                <option value="email">Email</option>
                <option value="reports">Reports</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                <ListIcon className="w-4 h-4" /> Items Per Page
              </label>
              <select 
                name="itemsPerPage" 
                value={display.itemsPerPage || 25} 
                onChange={handleDisplayChange}
                className="input-field"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button 
            onClick={() => savePreferences('display')} 
            className="btn-primary flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (
              <>
                <SaveIcon className="w-4 h-4" />
                Save Display Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings;