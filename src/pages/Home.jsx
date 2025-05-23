import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getIcon } from '../utils/iconUtils';
import DealsModule from '../components/deals/DealsModule';
import ActivitiesModule from '../components/activities/ActivitiesModule';
import EmailModule from '../components/email/EmailModule';
import ReportsModule from '../components/reports/ReportsModule';
import SettingsModule from '../components/settings/SettingsModule';
import DocumentsModule from '../components/documents/DocumentsModule';
import MainFeature from '../components/MainFeature';

const Home = ({ darkMode, currentUser }) => {
  const [activeTab, setActiveTab] = useState('contacts');
  const navigate = useNavigate();
  // Icons
  const DashboardIcon = getIcon('layout-dashboard'); 
  const UsersIcon = getIcon('users');
  const DollarSignIcon = getIcon('dollar-sign');
  const CalendarIcon = getIcon('calendar');
  const MailIcon = getIcon('mail');
  const BarChartIcon = getIcon('bar-chart-2');
  const FileIcon = getIcon('file-text');
  const SettingsIcon = getIcon('settings'); 
  
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { id: 'contacts', label: 'Contacts', icon: UsersIcon },
    { id: 'deals', label: 'Deals', icon: DollarSignIcon },
    { id: 'activities', label: 'Activities', icon: CalendarIcon },
    { id: 'email', label: 'Email', icon: MailIcon },
    { id: 'documents', label: 'Documents', icon: FileIcon },
    { id: 'reports', label: 'Reports', icon: BarChartIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Special handling for navigation items with paths
    const item = navigationItems.find(item => item.id === tabId);
    if (item && item.path) {
      navigate(item.path);
      return;
    }
  };
  
  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Sidebar Navigation */}
      <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-10 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
        <div className="flex justify-around">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center py-3 px-2 ${
                activeTab === item.id
                  ? 'text-primary'
                  : 'text-surface-600 dark:text-surface-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
        {activeTab === 'contacts' ? (
          <MainFeature darkMode={darkMode} currentUser={currentUser} />
        ) : activeTab === 'deals' ? (
          <DealsModule darkMode={darkMode} currentUser={currentUser} />
        ) : activeTab === 'activities' ? (
          <ActivitiesModule darkMode={darkMode} currentUser={currentUser} />
        ) : activeTab === 'email' ? (
          <EmailModule darkMode={darkMode} currentUser={currentUser} />
        ) : activeTab === 'reports' ? (
          <ReportsModule darkMode={darkMode} currentUser={currentUser} />
        ) : activeTab === 'settings' ? (
          <SettingsModule darkMode={darkMode} currentUser={currentUser} />
        ) : activeTab === 'documents' ? (
          <DocumentsModule darkMode={darkMode} currentUser={currentUser} />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center flex flex-col items-center justify-center py-12"
          >
            <div className="w-16 h-16 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
              {(() => {
                const Icon = getIcon(activeTab === 'dashboard' ? 'layout-dashboard' : activeTab);
                return <Icon className="w-8 h-8 text-primary" />;
              })()}
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
            </h1>
            <p className="text-surface-600 dark:text-surface-400 max-w-md">
              This feature is coming soon in our next update. Please explore the Contacts module which is fully functional.
            </p>
            <button 
              onClick={() => handleTabChange('contacts')}
              className="btn-primary mt-6"
            >
              Go to Contacts
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;