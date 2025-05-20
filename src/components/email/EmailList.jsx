import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getIcon } from '../../utils/iconUtils';

const EmailList = ({ 
  emails, 
  isLoading, 
  searchTerm, 
  onSearchChange, 
  onSelectEmail, 
  onDeleteEmail, 
  onRefresh, 
  activeFolder,
  currentUser
}) => {
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Icons
  const SearchIcon = getIcon('search');
  const RefreshIcon = getIcon('refresh-cw');
  const ChevronDownIcon = getIcon('chevron-down');
  const ChevronUpIcon = getIcon('chevron-up');
  const TrashIcon = getIcon('trash');
  const StarIcon = getIcon('star');
  const StarFilledIcon = getIcon('star-filled');
  const CircleIcon = getIcon('circle');
  const MailIcon = getIcon('mail');
  const CheckIcon = getIcon('check');
  const PaperclipIcon = getIcon('paperclip');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Sort emails
  const sortedEmails = [...emails].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.timestamp) - new Date(b.timestamp);
    } else if (sortBy === 'from') {
      comparison = a.from.name.localeCompare(b.from.name);
    } else if (sortBy === 'subject') {
      comparison = a.subject.localeCompare(b.subject);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = sortDirection === 'asc' ? ChevronUpIcon : ChevronDownIcon;

  return (
    <div className="card h-full flex flex-col">
      {/* Header with search and actions */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-bold capitalize">{activeFolder}</h2>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              title="Refresh"
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Sort options */}
      <div className="px-4 py-2 bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700 flex justify-between text-sm">
        <button
          onClick={() => handleSort('from')}
          className="flex items-center gap-1 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
        >
          <span>From</span>
          {sortBy === 'from' && <SortIcon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => handleSort('subject')}
          className="flex items-center gap-1 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
        >
          <span>Subject</span>
          {sortBy === 'subject' && <SortIcon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => handleSort('date')}
          className="flex items-center gap-1 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
        >
          <span>Date</span>
          {sortBy === 'date' && <SortIcon className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Email list */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
          </div>
        ) : sortedEmails.length > 0 ? (
          <ul className="divide-y divide-surface-200 dark:divide-surface-700">
            {sortedEmails.map(email => (
              <motion.li
                key={email.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 flex gap-3 cursor-pointer ${!email.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1 pt-1">
                    {!email.read && <CircleIcon className="w-3 h-3 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => onSelectEmail(email)}>
                    <div className="flex justify-between">
                      <span className={`font-medium ${!email.read ? 'text-black dark:text-white' : 'text-surface-600 dark:text-surface-400'}`}>
                        {activeFolder === 'sent' ? `To: ${email.to.map(t => t.name).join(', ')}` : email.from.name}
                      </span>
                      <span className="text-xs text-surface-500 whitespace-nowrap">
                        {format(new Date(email.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="font-medium truncate">{email.subject}</div>
                    <div className="text-sm text-surface-600 dark:text-surface-400 truncate">{email.preview}</div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-surface-500">
            <MailIcon className="w-10 h-10 mb-2 opacity-30" />
            <p>No emails found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;