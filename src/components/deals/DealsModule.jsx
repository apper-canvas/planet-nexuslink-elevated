import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import DealList from './DealList';
import DealForm from './DealForm';
import DealPipeline from './DealPipeline';
import DealService from '../../services/DealService';
import { formatCurrency, calculatePipelineValue, calculateWeightedPipelineValue } from '../../utils/dealsUtils';

const DealsModule = ({ darkMode, currentUser }) => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' or 'list'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isViewingDeal, setIsViewingDeal] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  // Icons
  const ListIcon = getIcon('list');
  const ColumnsIcon = getIcon('columns');
  const PlusIcon = getIcon('plus');
  const UserCircleIcon = getIcon('user-circle');
  const CalendarIcon = getIcon('calendar');
  const TagIcon = getIcon('tag');
  const DollarIcon = getIcon('dollar-sign');
  const FileTextIcon = getIcon('file-text');
  const XIcon = getIcon('x');
  const TrashIcon = getIcon('trash');
  const CheckCircleIcon = getIcon('check-circle');

  // Load deals and contacts on mount
  useEffect(() => {
    const fetchData = async () => {
      await loadDeals();
    };
    
    fetchData();
    
    // Load contacts from localStorage
    const storedContacts = localStorage.getItem('crm-contacts');
    if (storedContacts) {
      try {
        setContacts(JSON.parse(storedContacts));
      } catch (error) {
        console.error('Error parsing contacts from localStorage:', error);
        setContacts([]);
      }
    }
  }, []);

  // Load deals from the service
  const loadDeals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allDeals = await DealService.getAllDeals();
      setDeals(allDeals);
    } catch (err) {
      setError(err.message || 'An error occurred while loading deals');
      toast.error('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new deal
  const handleCreateDeal = () => {
    setCurrentDeal(null);
    setIsFormOpen(true);
  };

  // Handle editing a deal
  const handleEditDeal = (deal) => {
    setCurrentDeal(deal);
    setIsFormOpen(true);
  };

  // Handle viewing a deal
  const handleViewDeal = (deal) => {
    setSelectedDeal(deal);
    setIsViewingDeal(true);
  };

  // Handle form submission
  const handleSubmitDeal = async (dealData) => {
    setIsLoading(true);
    try {
      if (currentDeal) {
        // Update existing deal
        await DealService.updateDeal(currentDeal.id, dealData);
        toast.success('Deal updated successfully');
      } else {
        // Create new deal
        await DealService.createDeal(dealData);
        toast.success('Deal created successfully');
      }
      
      await loadDeals();
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err.message || 'An error occurred while saving the deal');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating deal stage (for pipeline drag & drop)
  const handleUpdateDealStage = async (dealId, newStage) => {
    setIsLoading(true);
    try {
      await DealService.updateDeal(dealId, { stage: newStage });
      await loadDeals();
    } catch (err) {
      toast.error(err.message || 'An error occurred while updating deal stage');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a deal
  const handleDeleteDeal = (deal) => {
    setSelectedDeal(deal);
    setIsConfirmDeleteOpen(true);
  };

  // Confirm and execute deal deletion
  const confirmDeleteDeal = async () => {
    if (selectedDeal) {
      setIsLoading(true);
      try {
        await DealService.deleteDeal(selectedDeal.id);
        toast.success('Deal deleted successfully');
        await loadDeals();
        setIsConfirmDeleteOpen(false);
        setIsViewingDeal(false);
      } catch (err) {
        toast.error(err.message || 'An error occurred while deleting the deal');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get contact details
  const getContactDetails = (contactId) => {
    return contacts.find(contact => contact.id === contactId) || { name: 'Unknown', company: 'Unknown' };
  };

  // Calculate totals
  let pipelineValue = 0;
  let weightedValue = 0; 
  let openDeals = 0;
  let closedWonDeals = 0;

  if (Array.isArray(deals)) {
    pipelineValue = calculatePipelineValue(deals);
    weightedValue = calculateWeightedPipelineValue(deals);
    openDeals = deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage)).length;
    closedWonDeals = deals.filter(deal => deal.stage === 'closed_won').length;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="loader">Loading deals...</div>
    </div>;
  }

  return (
    <div className="deals-module h-full">
      {/* Header with stats & controls */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Deals</h1>
          <div className="flex items-center gap-3">
            <div className="flex border border-surface-200 dark:border-surface-700 rounded-lg">
              <button 
                onClick={() => setViewMode('pipeline')} 
                className={`p-2 ${viewMode === 'pipeline' ? 'bg-primary/10 text-primary' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
                title="Pipeline View"
              >
                <ColumnsIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
                title="List View"
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleCreateDeal}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Deal</span>
            </button>
          </div>
        </div>
        
        {/* Deal stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <span className="stat-label">Pipeline Value</span>
            <div className="stat-value">{formatCurrency(pipelineValue)}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Weighted Value</span>
            <div className="stat-value">{formatCurrency(weightedValue)}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Open Deals</span>
            <div className="stat-value">{openDeals}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Closed Won</span>
            <div className="stat-value">{closedWonDeals}</div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="card h-[calc(100%-120px)] overflow-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 p-6">
            <span className="text-xl font-bold mb-2">Error loading deals</span>
            <p>{error}</p>
            <button onClick={loadDeals} className="btn-primary mt-4">Retry</button>
          </div>
        ) : viewMode === 'pipeline' ? (
          <DealPipeline 
            deals={deals || []} 
            onUpdateDealStage={handleUpdateDealStage}
            onViewDeal={handleViewDeal}
            onEditDeal={handleEditDeal}
            contacts={contacts}
          />
        ) : (
          <DealList 
            deals={deals || []}
            onViewDeal={handleViewDeal}
            onEditDeal={handleEditDeal}
            onDeleteDeal={handleDeleteDeal}
            onCreateDeal={handleCreateDeal}
            contacts={contacts}
          />
        )}
      </div>
      
      {/* Deal Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-soft w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    {currentDeal ? 'Edit Deal' : 'Create New Deal'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <DealForm
                  deal={currentDeal}
                  onSubmit={handleSubmitDeal}
                  onCancel={() => setIsFormOpen(false)}
                  contacts={contacts}
                  currentUser={currentUser}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Deal View Modal */}
      <AnimatePresence>
        {isViewingDeal && selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsViewingDeal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-soft w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">{selectedDeal.title}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setIsViewingDeal(false); handleEditDeal(selectedDeal); }}
                      className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg"
                      title="Edit Deal"
                    >
                      {getIcon('edit')('w-5 h-5 text-primary')}
                    </button>
                    <button
                      onClick={() => { setIsViewingDeal(false); handleDeleteDeal(selectedDeal); }}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title="Delete Deal"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                    <button
                      onClick={() => setIsViewingDeal(false)}
                      className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-4">Deal Information</h3>
                      <div className="space-y-3">
                        <div className="flex gap-3 items-center">
                          <DollarIcon className="w-5 h-5 text-surface-400" />
                          <div>
                            <div className="text-sm text-surface-500">Amount</div>
                            <div className="font-medium">{formatCurrency(selectedDeal.amount || 0)}</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          {getIcon('target')('w-5 h-5 text-surface-400')}
                          <div>
                            <div className="text-sm text-surface-500">Probability</div>
                            <div className="font-medium">{selectedDeal.probability || 0}%</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          <CalendarIcon className="w-5 h-5 text-surface-400" />
                          <div>
                            <div className="text-sm text-surface-500">Expected Close Date</div>
                            <div className="font-medium">
                              {selectedDeal.expectedCloseDate ? new Date(selectedDeal.expectedCloseDate).toLocaleDateString() : 'Not set'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          {getIcon('activity')('w-5 h-5 text-surface-400')}
                          <div>
                            <div className="text-sm text-surface-500">Stage</div>
                            <div className="font-medium capitalize">
                              {selectedDeal.stage?.replace('_', ' ') || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-4">Contact & Details</h3>
                      <div className="space-y-3">
                        <div className="flex gap-3 items-center">
                          <UserCircleIcon className="w-5 h-5 text-surface-400" />
                          <div>
                            <div className="text-sm text-surface-500">Contact</div>
                            <div className="font-medium">
                              {getContactDetails(selectedDeal.contactId).name}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          {getIcon('building')('w-5 h-5 text-surface-400')}
                          <div>
                            <div className="text-sm text-surface-500">Company</div>
                            <div className="font-medium">
                              {getContactDetails(selectedDeal.contactId).company}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          {getIcon('user')('w-5 h-5 text-surface-400')}
                          <div>
                            <div className="text-sm text-surface-500">Owner</div>
                            <div className="font-medium">{selectedDeal.ownerId || currentUser}</div>
                          </div>
                        </div>
                        
                        {selectedDeal.tags && (Array.isArray(selectedDeal.tags) ? selectedDeal.tags.length > 0 : selectedDeal.tags) && (
                          <div className="flex gap-3 items-start">
                            <TagIcon className="w-5 h-5 text-surface-400 mt-0.5" />
                            <div>
                              <div className="text-sm text-surface-500">Tags</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(Array.isArray(selectedDeal.tags) ? selectedDeal.tags : selectedDeal.tags.split(',').filter(tag => tag.trim())).map((tag, index) => (
                                  <span key={index} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedDeal.description && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <div className="bg-surface-50 dark:bg-surface-700 p-3 rounded-lg text-surface-700 dark:text-surface-300">
                        {selectedDeal.description}
                      </div>
                    </div>
                  )}
                  
                  {selectedDeal.activities && selectedDeal.activities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recent Activities</h3>
                      <div className="space-y-2">
                        {selectedDeal.activities.map(activity => (
                          <div 
                            key={activity.id} 
                            className="p-3 border border-surface-200 dark:border-surface-700 rounded-lg"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium capitalize">{activity.type}</span>
                              <span className="text-sm text-surface-500">
                                {new Date(activity.date).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-surface-600 dark:text-surface-400 mt-1">
                              {activity.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsConfirmDeleteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-soft w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <TrashIcon className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Delete Deal</h2>
                    <p className="text-surface-500">This action cannot be undone.</p>
                  </div>
                </div>
                
                <p className="mb-6">
                  Are you sure you want to delete <span className="font-medium">{selectedDeal?.title}</span>?
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsConfirmDeleteOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteDeal}
                    className="btn-danger"
                  >
                    Delete Deal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DealsModule;