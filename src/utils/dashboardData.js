import DealsService from '../services/DealsService';
import { calculatePipelineValue, calculateWeightedPipelineValue } from './dealsUtils';

/**
 * Generates mock sales data for the dashboard based on filters
 * @param {string} timeframe - week, month, quarter, year
 * @param {string} regionFilter - Filter by region
 * @param {string} teamFilter - Filter by team
 * @param {string} productFilter - Filter by product
 * @returns {Array} Array of sales data objects
 */
export const generateSalesData = (timeframe, regionFilter, teamFilter, productFilter) => {
  // Get actual deals from the DealsService
  const deals = DealsService.getAllDeals();
  const pipelineValue = calculatePipelineValue(deals);
  const hasDeals = deals.length > 0;
  const periods = getPeriodsByTimeframe(timeframe);
  const dealsMultiplier = hasDeals ? 1 : 0;
  
  // Apply filters - this is simulated by adjusting the baseline values
  const regionMultiplier = regionFilter === 'all' ? 1 : 
    (regionFilter === 'north-america' ? 1.2 : 
     regionFilter === 'europe' ? 0.9 :
     regionFilter === 'asia-pacific' ? 1.1 : 0.8);
    
  const teamMultiplier = teamFilter === 'all' ? 1 : 
    (teamFilter === 'sales-team' ? 1.3 : 
     teamFilter === 'account-managers' ? 1.1 : 0.9);
     
  const productMultiplier = productFilter === 'all' ? 1 :
    (productFilter === 'software' ? 1.2 :
     productFilter === 'hardware' ? 0.95 :
     productFilter === 'services' ? 1.1 : 0.9);
  
  // Generate data with slight random variations
  return periods.map((period, index) => {
    // Base revenue with a slight upward trend and some randomness
    const baseRevenue = 100 + (index * 5) + (Math.random() * 20 - 10);
    
    // Apply filters
    let filteredRevenue = baseRevenue * regionMultiplier * teamMultiplier * productMultiplier;
    
    // If we have actual deals, use a more realistic revenue projection
    if (hasDeals) {
      // Create some variety in the deal distribution
      const periodVariance = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
      const dealsRevenue = (pipelineValue / periods.length) * periodVariance * regionMultiplier;
      filteredRevenue = dealsRevenue / 1000; // Convert to thousands for display
    }
    
    // Profit is usually 20-40% of revenue
    const profitMargin = 0.2 + (Math.random() * 0.2);
    
    return {
      period,
      revenue: Math.round(filteredRevenue),
      profit: Math.round(filteredRevenue * profitMargin),
      newCustomers: Math.round(5 + (Math.random() * 15))
    };
  });
};

/**
 * Generates mock team performance data
 * @param {string} timeframe - week, month, quarter, year
 * @param {string} regionFilter - Filter by region
 * @param {string} teamFilter - Filter by team 
 * @returns {Array} Array of team member performance objects
export const generateTeamData = (timeframe, regionFilter, teamFilter) => {  
  const deals = DealsService.getAllDeals();
  const hasDeals = deals.length > 0;
export const generateTeamData = (timeframe, regionFilter, teamFilter) => {
  const periods = getPeriodsByTimeframe(timeframe);
  
  // Mock team members - filter based on teamFilter
  let teamMembers = [
    { name: 'John Smith', team: 'sales-team' },
    { name: 'Sarah Johnson', team: 'sales-team' },
    { name: 'David Chen', team: 'account-managers' },
    { name: 'Maria Rodriguez', team: 'support-team' }
  ];
  
  if (teamFilter !== 'all') {
    teamMembers = teamMembers.filter(member => member.team === teamFilter);
    // If filtering results in empty team, keep at least one member
    if (teamMembers.length === 0) {
      teamMembers = [{ name: 'John Smith', team: 'sales-team' }];
    }
  }
  
  // Apply region filter
  const regionMultiplier = regionFilter === 'all' ? 1 : 
    (regionFilter === 'north-america' ? 1.2 : 
  // Get deal counts by owner
  const dealsByOwner = {};
  if (hasDeals) {
    deals.forEach(deal => {
      dealsByOwner[deal.ownerId] = (dealsByOwner[deal.ownerId] || 0) + 1;
    });
  }
  
     regionFilter === 'europe' ? 0.9 :
  return teamMembers.map((member, index) => {
  
  // Generate data for each team member
  return teamMembers.map(member => {
    // Give each team member a different baseline and trend
    const baselineDeals = 10 + Math.floor(Math.random() * 5);
    const trend = Math.random() * 0.4 - 0.1; // Between -10% and +30%
    
    return {
      name: member.name,
      team: member.team,
      data: periods.map((period, index) => {
        // Generate deals with a trend and some randomness
        let dealsCount = Math.max(1, Math.round(
          (baselineDeals + (baselineDeals * trend * index)) * regionMultiplier * 
          (0.8 + Math.random() * 0.4) // Random factor 0.8-1.2
        ));
        
        // If we have actual deals, use real deal counts with some randomness
        if (hasDeals && dealsByOwner[member.name]) {
          // Distribute deals across periods with some randomness
          const ownerDeals = dealsByOwner[member.name];
          const periodVariance = 0.7 + (Math.random() * 0.6); // 0.7 to 1.3
          dealsCount = Math.max(1, Math.round(
            (ownerDeals / periods.length) * periodVariance * regionMultiplier
        ));
        
        return {
          period,
          deals
        };
      })
    };
  });
};

/**
 * Generates mock customer interaction data
 * @param {string} timeframe - week, month, quarter, year
 * @param {string} regionFilter - Filter by region
 * @param {string} productFilter - Filter by product
 * @returns {Array} Array of customer segment data
 */
export const generateCustomerData = (timeframe, regionFilter, productFilter) => {
  // Base customer segments
  const segments = [
    { segment: 'Enterprise', value: 35 },
    { segment: 'Mid-Market', value: 30 },
    { segment: 'SMB', value: 25 },
    { segment: 'Startup', value: 10 }
  ];
  
  // Apply filters to adjust values
  const regionAdjustment = {
    'all': { Enterprise: 0, 'Mid-Market': 0, SMB: 0, Startup: 0 },
    'north-america': { Enterprise: 10, 'Mid-Market': 5, SMB: -5, Startup: -10 },
    'europe': { Enterprise: 5, 'Mid-Market': 10, SMB: 0, Startup: -15 },
    'asia-pacific': { Enterprise: -5, 'Mid-Market': 0, SMB: 10, Startup: 20 },
    'latin-america': { Enterprise: -10, 'Mid-Market': -5, SMB: 15, Startup: 15 }
  };
  
  const productAdjustment = {
    'all': { Enterprise: 0, 'Mid-Market': 0, SMB: 0, Startup: 0 },
    'software': { Enterprise: 5, 'Mid-Market': 10, SMB: 0, Startup: 15 },
    'hardware': { Enterprise: 15, 'Mid-Market': 5, SMB: -5, Startup: -15 },
    'services': { Enterprise: 10, 'Mid-Market': 5, SMB: 5, Startup: -5 },
    'training': { Enterprise: -5, 'Mid-Market': 0, SMB: 10, Startup: 10 }
  };
  
  // Apply adjustments from filters
  return segments.map(item => {
    const regionAdj = regionAdjustment[regionFilter]?.[item.segment] || 0;
    const productAdj = productAdjustment[productFilter]?.[item.segment] || 0;
    
    // Calculate adjusted value and ensure it's at least 5
    const adjustedValue = Math.max(5, item.value + regionAdj + productAdj);
    
    return {
      ...item,
      value: adjustedValue,
      // Generate random interaction counts
      emails: Math.floor(Math.random() * 50) + 20,
      calls: Math.floor(Math.random() * 30) + 10,
      meetings: Math.floor(Math.random() * 15) + 5
    };
  });
};

/**
 * Calculate KPI metrics from the dashboard data
 * @param {Object} data - Object containing all dashboard data
 * @returns {Object} KPI metrics
 */
export const calculateKpiMetrics = (data) => {
  const { sales, team, customer } = data;
  
  // Calculate total revenue
  const deals = DealsService.getAllDeals();
  const hasDeals = deals.length > 0;
  
  const totalRevenue = sales.reduce((sum, item) => sum + item.revenue, 0);
  const previousRevenue = totalRevenue * (0.85 + Math.random() * 0.3); // Simulated previous period
  const revenueTrend = Math.round((totalRevenue / previousRevenue - 1) * 100);
  
  // Calculate total deals
  const totalDeals = team.reduce(
    (sum, member) => sum + member.data.reduce((s, period) => s + period.deals, 0), 
    0
  );
  const previousDeals = totalDeals * (0.85 + Math.random() * 0.3);
  const dealsTrend = Math.round((totalDeals / previousDeals - 1) * 100);

  // Include real deal data if available
  const actualDeals = hasDeals ? deals.length : 0;
  const closedWonDeals = hasDeals ? deals.filter(d => d.stage === 'closed_won').length : 0;
  const closedWonRate = actualDeals > 0 ? Math.round((closedWonDeals / actualDeals) * 100) : 0;
  const pipelineValue = hasDeals ? calculatePipelineValue(deals) : 0;
  
  // Calculate total interactions
  const totalInteractions = customer.reduce(
    (sum, segment) => sum + (segment.emails || 0) + (segment.calls || 0) + (segment.meetings || 0),
    0
  );
  const previousInteractions = totalInteractions * (0.85 + Math.random() * 0.3);
  const interactionsTrend = Math.round((totalInteractions / previousInteractions - 1) * 100);
  
  // Calculate conversion rate
  const conversionRate = Math.round((totalDeals / (totalInteractions * 0.2)) * 100);
  const previousConversion = conversionRate * (0.85 + Math.random() * 0.3);
  const conversionTrend = Math.round((conversionRate / previousConversion - 1) * 100);
  
  return {
    totalRevenue: `$${totalRevenue}k`,
    revenueTrend,
    totalDeals,
    dealsTrend,
    totalInteractions,
    interactionsTrend, 
    actualDeals,
    closedWonDeals,
    closedWonRate,
    conversionRate: `${conversionRate}%`,
    conversionTrend
  };
};

/**
 * Helper function to get time periods based on timeframe
 */
const getPeriodsByTimeframe = (timeframe) => {
  switch (timeframe) {
    case 'week':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    case 'month':
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    case 'quarter':
      return ['Jan', 'Feb', 'Mar'];
    case 'year':
      return ['Q1', 'Q2', 'Q3', 'Q4'];
    default:
      return ['Period 1', 'Period 2', 'Period 3', 'Period 4'];
  }
};