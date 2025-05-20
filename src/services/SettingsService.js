/**
 * Service for managing user settings
 */

// Default settings
const DEFAULT_SETTINGS = {
  account: {
    name: 'Current User',
    email: 'user@example.com',
    role: 'Admin',
    avatar: null,
    language: 'en-US',
    timezone: 'UTC'
  },
  preferences: {
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      deals: true,
      activities: true,
      mentions: true,
      system: true
    },
    display: {
      compactView: false,
      showTags: true,
      defaultTab: 'contacts',
      itemsPerPage: 25
    }
  },
  theme: {
    mode: 'system', // 'light', 'dark', 'system'
    primaryColor: '#3b82f6',
    accentColor: '#f43f5e',
    customFont: 'Inter',
    borderRadius: 'medium',
    animations: true
  },
  crm: {
    pipelines: [
      {
        id: 'default',
        name: 'Default Pipeline',
        stages: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
      }
    ],
    customFields: [
      { id: 'industry', name: 'Industry', type: 'select', entity: 'contact' },
      { id: 'source', name: 'Lead Source', type: 'select', entity: 'contact' }
    ],
    tags: ['VIP', 'Hot Lead', 'Returning', 'Cold']
  },
  integrations: {
    google: { connected: false, email: '' },
    outlook: { connected: false, email: '' },
    slack: { connected: false, workspace: '' },
    zoom: { connected: false },
    stripe: { connected: false }
  },
  subscription: {
    plan: 'Professional',
    status: 'Active',
    nextBillingDate: '2023-12-01',
    billingCycle: 'monthly',
    price: 49.99
  }
};

/**
 * Loads user settings from localStorage
 * @returns {Object} User settings
 */
const loadSettings = () => {
  try {
    const settings = localStorage.getItem('crm-user-settings');
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Saves user settings to localStorage
 * @param {Object} settings - User settings to save
 */
const saveSettings = (settings) => {
  try {
    localStorage.setItem('crm-user-settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Updates a specific settings section
 * @param {string} section - Settings section to update (account, preferences, theme, crm, integrations, subscription)
 * @param {Object} values - New values for the section
 * @returns {Object} Updated settings
 */
const updateSettings = (section, values) => {
  const currentSettings = loadSettings();
  
  // Create a deep copy of the current settings
  const updatedSettings = JSON.parse(JSON.stringify(currentSettings));
  
  // Update only the specified section
  updatedSettings[section] = {
    ...updatedSettings[section],
    ...values
  };
  
  // Save the updated settings
  saveSettings(updatedSettings);
  return updatedSettings;
};

/**
 * Reset settings to default values
 * @returns {Object} Default settings
 */
const resetSettings = () => {
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
};

export { loadSettings, saveSettings, updateSettings, resetSettings, DEFAULT_SETTINGS };