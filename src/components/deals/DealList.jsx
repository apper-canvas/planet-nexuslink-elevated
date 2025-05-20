import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getIcon } from '../../utils/iconUtils';
import { formatCurrency, getStageColorClass, getStageDetails } from '../../utils/dealsUtils';
import { DEAL_STAGES } from '../../services/DealsService';
import { format } from 'date-fns';

const DealList = ({ 
  deals, 
  onViewDeal, 
  onEditDeal, 
  onDeleteDeal, 
  onCreateDeal,
  contacts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStage, setFilterStage] = useState('all');

  // Icons
  const SearchIcon = getIcon('search');
  const SortIcon = getIcon('arrow-up-down');
  const PlusIcon = getIcon('plus');
  const EditIcon = getIcon('edit');
  const TrashIcon = getIcon('trash');
  const InfoIcon = getIcon('info');
  const UsersIcon = getIcon('users');
  const CalendarIcon = getIcon('calendar');
  const DollarIcon = getIcon('dollar-sign');
  const CheckSquareIcon = getIcon('check-square');
  const ChevronUpIcon = getIcon('chevron-up');
  const ChevronDownIcon = getIcon('chevron-down');
  const TagIcon = getIcon('tag');
  const FileTextIcon = getIcon('file-text');

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let filtered = [...deals];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchLower) ||
        deal.description?.toLowerCase().includes(searchLower) ||
        deal.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply stage filter
    if (filterStage !== 'all') {
      filtered = filtered.filter(deal => deal.stage === filterStage);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'title':
          valueA = a.title;
          valueB = b.title;
          break;
        case 'amount':
          valueA = a.amount || 0;
          valueB = b.amount || 0;
          break;
        case 'probability':
          valueA = a.probability || 0;
          valueB = b.probability || 0;
          break;
        case 'expectedCloseDate':
          valueA = new Date(a.expectedCloseDate || 0);
          valueB = new Date(b.expectedCloseDate || 0);
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        case 'updatedAt':
        default:
          valueA = new Date(a.updatedAt);
          valueB = new Date(b.updatedAt);
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return filtered;
  }, [deals, searchTerm, filterStage, sortBy, sortDirection]);

  // Handle sort click
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Get contact name from ID
  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortBy !== field) return <SortIcon className="w-4 h-4 text-surface-400" />;
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-primary" />
      : <ChevronDownIcon className="w-4 h-4 text-primary" />;
  };

  if (!deals.length) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
          <DollarIcon className="w-8 h-8 text-surface-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No deals found</h3>
        <p className="text-surface-500 max-w-md mb-6">
          Your sales pipeline is empty. Create your first deal to start tracking your sales opportunities.
        </p>
        <button onClick={onCreateDeal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Create Deal
        </button>
      </div>
    );
  }

  return (
    <div className="deals-list">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field py-2 pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="input-field py-2 min-w-[120px]"
          >
            <option value="all">All Stages</option>
            {DEAL_STAGES.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
          
          <button
            onClick={onCreateDeal}
            className="btn-primary flex items-center gap-1 py-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Deal</span>
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800">
              <th className="px-3 py-2 text-left border-b border-surface-200 dark:border-surface-700">
                <button 
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <span>Deal</span>
                  {renderSortIndicator('title')}
                </button>
              </th>
              <th className="px-3 py-2 text-left border-b border-surface-200 dark:border-surface-700">
                <button 
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <span>Amount</span>
                  {renderSortIndicator('amount')}
                </button>
              </th>
              <th className="px-3 py-2 text-left border-b border-surface-200 dark:border-surface-700">Stage</th>
              <th className="px-3 py-2 text-left border-b border-surface-200 dark:border-surface-700">
                <button 
                  onClick={() => handleSort('expectedCloseDate')}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <span>Expected Close</span>
                  {renderSortIndicator('expectedCloseDate')}
                </button>
              </th>
              <th className="px-3 py-2 text-left border-b border-surface-200 dark:border-surface-700">Contact</th>
              <th className="px-3 py-2 text-center border-b border-surface-200 dark:border-surface-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map(deal => (
              <motion.tr 
                key={deal.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                <td className="px-3 py-3 border-b border-surface-200 dark:border-surface-700">
                  <div className="font-medium">{deal.title}</div>
                  {deal.tags?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {deal.tags.map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 border-b border-surface-200 dark:border-surface-700">
                  {formatCurrency(deal.amount || 0)}
                </td>
                <td className="px-3 py-3 border-b border-surface-200 dark:border-surface-700">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStageColorClass(deal.stage)}`}>
                    {getStageDetails(deal.stage).name}
                  </span>
                </td>
                <td className="px-3 py-3 border-b border-surface-200 dark:border-surface-700">{formatDate(deal.expectedCloseDate)}</td>
                <td className="px-3 py-3 border-b border-surface-200 dark:border-surface-700">{getContactName(deal.contactId)}</td>
                <td className="px-3 py-3 border-b border-surface-200 dark:border-surface-700">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => onViewDeal(deal)} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700" title="View Deal"><InfoIcon className="w-4 h-4" /></button>
                    <button onClick={() => onEditDeal(deal)} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700" title="Edit Deal"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDeleteDeal(deal)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30" title="Delete Deal"><TrashIcon className="w-4 h-4 text-red-500" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealList;