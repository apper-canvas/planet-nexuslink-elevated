import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { DEAL_STAGES } from '../../services/DealsService';
import { formatCurrency, getStageBorderClass } from '../../utils/dealsUtils';

const DealPipeline = ({ 
  deals, 
  onUpdateDealStage, 
  onViewDeal, 
  onEditDeal,
  contacts 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterContact, setFilterContact] = useState('all');

  // Icons
  const SearchIcon = getIcon('search');
  const DollarIcon = getIcon('dollar-sign');
  const UsersIcon = getIcon('users');
  const CalendarIcon = getIcon('calendar');

  // Filter deals by search term and contact
  const filteredDeals = useMemo(() => {
    let filtered = [...deals];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchLower) ||
        deal.description?.toLowerCase().includes(searchLower) ||
        deal.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (filterContact !== 'all') {
      filtered = filtered.filter(deal => deal.contactId === filterContact);
    }
    
    return filtered;
  }, [deals, searchTerm, filterContact]);

  // Get contact name from ID
  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  // Organize deals by stage
  const dealsByStage = useMemo(() => {
    const organizedDeals = {};
    
    // Initialize all stages with empty arrays
    DEAL_STAGES.forEach(stage => {
      organizedDeals[stage.id] = [];
    });
    
    // Populate stages with filtered deals
    filteredDeals.forEach(deal => {
      if (organizedDeals[deal.stage]) {
        organizedDeals[deal.stage].push(deal);
      }
    });
    
    return organizedDeals;
  }, [filteredDeals]);

  // Calculate stage totals
  const stageTotals = useMemo(() => {
    const totals = {};
    
    Object.entries(dealsByStage).forEach(([stageId, stageDeals]) => {
      totals[stageId] = stageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    });
    
    return totals;
  }, [dealsByStage]);

  // Handle drag start
  const handleDragStart = (e, dealId) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  // Handle drop
  const handleDrop = (e, newStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    const deal = deals.find(d => d.id === dealId);
    
    if (deal && deal.stage !== newStage) {
      onUpdateDealStage(dealId, newStage);
      toast.success(`Moved "${deal.title}" to ${DEAL_STAGES.find(s => s.id === newStage).name}`);
    }
  };

  // Allow drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="deal-pipeline">
      {/* Pipeline Controls */}
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
        
        <div className="w-full md:w-64">
          <select
            value={filterContact}
            onChange={(e) => setFilterContact(e.target.value)}
            className="input-field py-2 w-full"
          >
            <option value="all">All Contacts</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>{contact.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Pipeline Board */}
      <div className="flex overflow-x-auto pb-4 -mx-2 pipeline-container">
        {DEAL_STAGES.map(stage => (
          <div 
            key={stage.id}
            className="min-w-[280px] mx-2 flex-1"
            onDrop={(e) => handleDrop(e, stage.id)} 
            onDragOver={handleDragOver}
          >
            <div className="bg-surface-50 dark:bg-surface-800 rounded-t-lg p-3 border-b border-surface-200 dark:border-surface-700">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{stage.name}</h3>
                <span className="text-sm text-surface-500">
                  {dealsByStage[stage.id].length} {dealsByStage[stage.id].length === 1 ? 'deal' : 'deals'}
                </span>
              </div>
              <div className="text-sm text-surface-600 dark:text-surface-400">
                {formatCurrency(stageTotals[stage.id] || 0)}
              </div>
            </div>
            
            <div className="bg-surface-50 dark:bg-surface-800 rounded-b-lg min-h-[400px] p-2">
              {dealsByStage[stage.id].map(deal => (
                <motion.div 
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  className={`deal-card bg-white dark:bg-surface-700 p-3 rounded-lg mb-2 border-l-4 cursor-pointer select-none ${getStageBorderClass(deal.stage)}`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onViewDeal(deal)}
                >
                  <h4 className="font-medium mb-1 truncate">{deal.title}</h4>
                  <div className="text-lg font-semibold text-surface-800 dark:text-white mb-2">
                    {formatCurrency(deal.amount || 0)}
                  </div>
                  <div className="flex gap-4 text-xs text-surface-500">
                    <div className="flex items-center gap-1"><UsersIcon className="w-3 h-3" /> {getContactName(deal.contactId)}</div>
                    {deal.expectedCloseDate && <div className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {new Date(deal.expectedCloseDate).toLocaleDateString()}</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealPipeline;