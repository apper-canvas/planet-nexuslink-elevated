import { DEAL_STAGES } from '../services/DealsService';
import { format } from 'date-fns';

/**
 * Format currency amount as USD
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Get stage details by stage ID
 * @param {string} stageId - The ID of the stage
 * @returns {Object} Stage details
 */
export const getStageDetails = (stageId) => {
  return DEAL_STAGES.find(stage => stage.id === stageId) || { id: stageId, name: 'Unknown', color: 'gray' };
};

/**
 * Get color class for a deal stage
 * @param {string} stageId - The ID of the stage
 * @returns {string} Tailwind color class
 */
export const getStageColorClass = (stageId) => {
  const stageMappings = {
    'lead': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'qualified': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    'proposal': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'negotiation': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    'closed_won': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'closed_lost': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  };
  
  return stageMappings[stageId] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

/**
 * Get border color class for a deal stage
 * @param {string} stageId - The ID of the stage
 * @returns {string} Tailwind border color class
 */
export const getStageBorderClass = (stageId) => {
  const stageMappings = {
    'lead': 'border-blue-300 dark:border-blue-700',
    'qualified': 'border-indigo-300 dark:border-indigo-700',
    'proposal': 'border-purple-300 dark:border-purple-700',
    'negotiation': 'border-amber-300 dark:border-amber-700',
    'closed_won': 'border-green-300 dark:border-green-700',
    'closed_lost': 'border-red-300 dark:border-red-700'
  };
  
  return stageMappings[stageId] || 'border-gray-300 dark:border-gray-700';
};

/**
 * Calculate total pipeline value for a set of deals
 * @param {Array} deals - Array of deals
 * @returns {number} Total pipeline value
 */
export const calculatePipelineValue = (deals) => {
  // Check if deals is an array, if not return 0
  if (!Array.isArray(deals)) {
    return 0;
  }
  
  return deals.reduce((total, deal) => {
    // Don't include closed lost deals in pipeline value
    if (deal.stage !== 'closed_lost') {
      return total + (deal.amount || 0);
    }
    return total;
  }, 0);
};

/**
 * Calculate weighted pipeline value (factoring in probability)
 * @param {Array} deals - Array of deals
 * @returns {number} Weighted pipeline value
 */
export const calculateWeightedPipelineValue = (deals) => {
  // Check if deals is an array, if not return 0
  if (!Array.isArray(deals)) {
    return 0;
  }
  
  return deals.reduce((total, deal) => {
    // Don't include closed lost deals in pipeline value
    if (deal.stage !== 'closed_lost') {
      const probability = deal.probability || 0;
      return total + ((deal.amount || 0) * (probability / 100));
    }
    return total;
  }, 0);
};