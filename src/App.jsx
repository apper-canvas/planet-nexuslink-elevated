import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getIcon } from './utils/iconUtils';
import Home from './pages/Home';
import Dashboard from './components/dashboard/Dashboard';
import NotFound from './pages/NotFound';
import { searchDocuments, formatSearchResults } from './utils/searchUtils';

const DEFAULT_USER = 'Current User';

function App() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    // Check for user preference
    if (localStorage.theme === 'dark' || 
        (!('theme' in localStorage) && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.theme = newMode ? 'dark' : 'light';
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const markNotificationAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      );
      localStorage.setItem('crm-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('crm-notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    
    // Set up event listener for new notifications
    const handleNewNotification = (event) => {
      const notification = event.detail;
      setNotifications(prev => {
        const updated = [notification, ...prev];
        localStorage.setItem('crm-notifications', JSON.stringify(updated));
        return updated;
      });
      toast.info(`You were mentioned in a note by ${notification.from}`);
    };
    
    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, []);
  
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('crm-notifications', JSON.stringify([]));
    toast.success('All notifications cleared');
  };
  
  const notificationRef = useRef(null);
  
  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle document search
  const handleSearch = useCallback((query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results = searchDocuments(query);
      const formattedResults = formatSearchResults(results);
      setSearchResults(formattedResults);
      setIsSearching(false);
    }, 300);
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      } else if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleViewDocument = (doc) => {
    // Navigate to the contact's document tab
    navigate(`/?contact=${doc.contactId}&tab=documents`);
    setShowSearch(false);
    
    // Show notification
    toast.info(`Navigating to document: ${doc.filename}`);
  };

  const handleDownloadDocument = (doc) => {
    toast.info(`Downloading ${doc.filename}`);
    setShowSearch(false);
  };

  const MoonIcon = getIcon('moon');
  const SunIcon = getIcon('sun');
  const BellIcon = getIcon('bell');
  const TrashIcon = getIcon('trash');
  const SearchIcon = getIcon('search');
  const FileIcon = getIcon('file-text');
  const DownloadIcon = getIcon('download');
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-primary font-bold text-xl">NexusLink</div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Beta</span>
          </div>
          
          {/* Global Search Bar */}
          <div className="hidden md:block relative flex-1 max-w-xl mx-12" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents... (Ctrl+K)"
                className="w-full py-1.5 pl-9 pr-4 rounded-lg bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                ref={searchInputRef}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
                <SearchIcon className="w-4 h-4" />
              </div>
            </div>
            
            {/* Search Results Dropdown */}
            {showSearch && (
              <div className="absolute mt-2 w-full bg-white dark:bg-surface-800 shadow-lg rounded-lg border border-surface-200 dark:border-surface-700 z-50">
                <div className="p-3 border-b border-surface-200 dark:border-surface-700">
                  <h3 className="font-medium text-sm">Search Results</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-6 text-center text-surface-500">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((result) => {
                        const ResultIcon = getIcon(result.icon);
                        return (
                          <div key={result.id} className="p-3 border-b border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 flex items-center justify-center">
                                <ResultIcon className="w-5 h-5 text-surface-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{result.filename}</div>
                                <div className="text-xs text-surface-500 flex items-center gap-2">
                                  <span>{result.category}</span>
                                  <span>•</span>
                                  <span>{result.formattedSize}</span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => handleViewDocument(result)} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-600" title="View document">
                                  <FileIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDownloadDocument(result)} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-600" title="Download document">
                                  <DownloadIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : searchQuery.length > 0 ? (
                    <div className="p-6 text-center text-surface-500">
                      No documents found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="p-6 text-center text-surface-500">
                      Type to search for documents
                    </div>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="p-2 text-xs text-surface-500 text-center border-t border-surface-200 dark:border-surface-700">
                    Press Enter to view all {searchResults.length} results
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Search"
            >
              <SearchIcon className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors relative">
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-800 shadow-lg rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
                  <div className="p-3 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        className="text-sm text-surface-500 hover:text-red-500 flex items-center gap-1"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span>Clear all</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-surface-500 dark:text-surface-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer ${notification.read ? 'opacity-70' : ''}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${notification.read ? 'bg-surface-300 dark:bg-surface-600' : 'bg-primary'}`}></div>
                            <div>
                              <p className="text-sm mb-1">
                                <span className="font-medium">{notification.from}</span> mentioned you in a note about <span className="font-medium">{notification.contactName}</span>
                              </p>
                              <p className="text-xs text-surface-500 dark:text-surface-400">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} currentUser={DEFAULT_USER} />} />
          <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <footer className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 py-4 text-sm text-surface-500">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p>© 2023 NexusLink CRM. All rights reserved.</p>
          <div className="mt-2 md:mt-0 flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}

export default App;