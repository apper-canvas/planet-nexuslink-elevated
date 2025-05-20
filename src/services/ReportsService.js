import { formatDate, getRandomValue } from '../utils/reportUtils';

// Simulated API call to fetch sales report data
export const fetchSalesReportData = (dateRange) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Generate data based on date range
      const periods = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      
      // Generate revenue trend data
      const revenueTrend = [];
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - periods);
      
      for (let i = 0; i < periods; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        
        revenueTrend.push({
          date: formatDate(currentDate, dateRange),
          value: getRandomValue(5000, 20000)
        });
      }
      
      // Generate deal stages data
      const dealsByStage = [
        { name: 'Qualification', value: getRandomValue(10, 30) },
        { name: 'Proposal', value: getRandomValue(8, 25) },
        { name: 'Negotiation', value: getRandomValue(5, 15) },
        { name: 'Closed Won', value: getRandomValue(10, 20) }
      ];
      
      // Generate sales rep data
      const salesByRep = [
        { name: 'Alice Johnson', value: getRandomValue(40000, 100000) },
        { name: 'Bob Smith', value: getRandomValue(30000, 90000) },
        { name: 'Carol Williams', value: getRandomValue(35000, 95000) },
        { name: 'David Brown', value: getRandomValue(25000, 85000) },
        { name: 'Eva Miller', value: getRandomValue(45000, 110000) }
      ];
      
      // Calculate KPIs
      const totalRevenue = salesByRep.reduce((sum, rep) => sum + rep.value, 0);
      const closedDeals = dealsByStage.find(stage => stage.name === 'Closed Won').value;
      const avgDealSize = Math.round(totalRevenue / closedDeals);
      const conversionRate = Math.round((closedDeals / dealsByStage.reduce((sum, stage) => sum + stage.value, 0)) * 100);
      
      // Return structured data
      resolve({
        totalRevenue,
        revenueGrowth: getRandomValue(-10, 30),
        closedDeals,
        dealsGrowth: getRandomValue(-5, 25),
        avgDealSize,
        avgSizeGrowth: getRandomValue(-15, 20),
        conversionRate,
        conversionGrowth: getRandomValue(-8, 15),
        revenueTrend,
        dealsByStage,
        salesByRep
      });
    }, 700);
  });
};

// Simulated API call to fetch activity report data
export const fetchActivityReportData = (dateRange) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Generate data based on date range
      const periods = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      
      // Generate activity trend data
      const activityTrend = [];
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - periods);
      
      for (let i = 0; i < periods; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        
        const total = getRandomValue(10, 30);
        const completed = getRandomValue(5, total);
        
        activityTrend.push({
          date: formatDate(currentDate, dateRange),
          total,
          completed
        });
      }
      
      // Generate activity types data
      const activitiesByType = [
        { name: 'Calls', value: getRandomValue(20, 50) },
        { name: 'Meetings', value: getRandomValue(15, 40) },
        { name: 'Tasks', value: getRandomValue(30, 70) },
        { name: 'Emails', value: getRandomValue(40, 100) },
        { name: 'Deadlines', value: getRandomValue(10, 30) }
      ];
      
      // Generate activities by rep data
      const activitiesByRep = [
        { name: 'Alice Johnson', completed: getRandomValue(15, 30), pending: getRandomValue(5, 15), overdue: getRandomValue(0, 5) },
        { name: 'Bob Smith', completed: getRandomValue(10, 25), pending: getRandomValue(8, 20), overdue: getRandomValue(1, 8) },
        { name: 'Carol Williams', completed: getRandomValue(20, 35), pending: getRandomValue(3, 12), overdue: getRandomValue(0, 3) },
        { name: 'David Brown', completed: getRandomValue(12, 28), pending: getRandomValue(7, 18), overdue: getRandomValue(2, 7) }
      ];
      
      // Calculate KPIs
      const totalActivities = activitiesByType.reduce((sum, type) => sum + type.value, 0);
      const completedActivities = Math.round(totalActivities * getRandomValue(0.6, 0.8));
      const overdueActivities = Math.round(totalActivities * getRandomValue(0.05, 0.15));
      const completionRate = Math.round((completedActivities / totalActivities) * 100);
      
      // Return structured data
      resolve({
        totalActivities,
        activityGrowth: getRandomValue(-5, 25),
        completedActivities,
        overdueActivities,
        completionRate,
        completionGrowth: getRandomValue(-8, 20),
        activityTrend,
        activitiesByType,
        activitiesByRep
      });
    }, 700);
  });
};