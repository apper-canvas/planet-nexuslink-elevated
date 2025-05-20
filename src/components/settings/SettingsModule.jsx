import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { loadSettings } from '../../services/SettingsService';
import AccountSettings from './AccountSettings';
import PreferencesSettings from './PreferencesSettings';
import ThemeSettings from './ThemeSettings';
import CrmSettings from './CrmSettings';
import IntegrationsSettings from './IntegrationsSettings';
import SubscriptionSettings from './SubscriptionSettings';

const SettingsModule = ({ darkMode, currentUser }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('account');
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Icons
  const UserIcon = getIcon('user');
  const BellIcon = getIcon('bell');
  const PaletteIcon = getIcon('palette');
  const DatabaseIcon = getIcon('database');
  const PlugIcon = getIcon('plug');
  const CreditCardIcon = getIcon('credit-card');

  useEffect(() => {
    // Load settings
    const loadUserSettings = async () => {
      try {
        setIsLoading(true);
        const userSettings = loadSettings();
        setSettings(userSettings);
      } catch (error) {
        toast.error('Failed to load settings');
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, []);

  const settingsTabs = [
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'preferences', label: 'Preferences', icon: BellIcon },
    { id: 'theme', label: 'Theme', icon: PaletteIcon },
    { id: 'crm', label: 'CRM Settings', icon: DatabaseIcon },
    { id: 'integrations', label: 'Integrations', icon: PlugIcon },
    { id: 'subscription', label: 'Subscription', icon: CreditCardIcon },
  ];

  const renderSettingsContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!settings) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load settings. Please refresh and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Refresh
          </button>
        </div>
      );
    }

    switch (activeSettingsTab) {
      case 'account':
        return <AccountSettings settings={settings} setSettings={setSettings} />;
      case 'preferences':
        return <PreferencesSettings settings={settings} setSettings={setSettings} />;
      case 'theme':
        return <ThemeSettings settings={settings} setSettings={setSettings} darkMode={darkMode} />;
      case 'crm':
        return <CrmSettings settings={settings} setSettings={setSettings} />;
      case 'integrations':
        return <IntegrationsSettings settings={settings} setSettings={setSettings} />;
      case 'subscription':
        return <SubscriptionSettings settings={settings} setSettings={setSettings} />;
      default:
        return <AccountSettings settings={settings} setSettings={setSettings} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="settings-navigation">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSettingsTab(tab.id)}
            className={`settings-nav-item ${
              activeSettingsTab === tab.id ? 'settings-nav-item-active' : 'settings-nav-item-inactive'
            } flex items-center gap-2`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      {renderSettingsContent()}
    </motion.div>
  );
};

export default SettingsModule;