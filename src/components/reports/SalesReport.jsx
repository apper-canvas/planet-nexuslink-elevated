import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getIcon } from '../../utils/iconUtils';
import { formatCurrency } from '../../utils/reportUtils';
import { fetchSalesReportData } from '../../services/ReportsService';

const SalesReport = ({ dateRange }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const TrendUpIcon = getIcon('trending-up');
  const TrendDownIcon = getIcon('trending-down');
  const DollarIcon = getIcon('dollar-sign');
  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
  
  useEffect(() => {
    setIsLoading(true);
    fetchSalesReportData(dateRange)
      .then(data => {
        setReportData(data);
        setIsLoading(false);
      });
  }, [dateRange]);
  
  if (isLoading) {
    return (
      <div className="report-container p-12 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div id="sales-report" className="report-container">
      <div className="report-header">
        <h2 className="text-xl font-bold">Sales Performance Dashboard</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 90 days'}
        </p>
      </div>
      
      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <div className="flex justify-between items-center">
            <span className="stat-value">{formatCurrency(reportData.totalRevenue)}</span>
            <div className={`flex items-center text-sm ${reportData.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {reportData.revenueGrowth >= 0 ? 
                <TrendUpIcon className="w-4 h-4 mr-1" /> : 
                <TrendDownIcon className="w-4 h-4 mr-1" />
              }
              {Math.abs(reportData.revenueGrowth)}%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Closed Deals</span>
          <div className="flex justify-between items-center">
            <span className="stat-value">{reportData.closedDeals}</span>
            <div className={`flex items-center text-sm ${reportData.dealsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {reportData.dealsGrowth >= 0 ? 
                <TrendUpIcon className="w-4 h-4 mr-1" /> : 
                <TrendDownIcon className="w-4 h-4 mr-1" />
              }
              {Math.abs(reportData.dealsGrowth)}%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Average Deal Size</span>
          <div className="flex justify-between items-center">
            <span className="stat-value">{formatCurrency(reportData.avgDealSize)}</span>
            <div className={`flex items-center text-sm ${reportData.avgSizeGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {reportData.avgSizeGrowth >= 0 ? 
                <TrendUpIcon className="w-4 h-4 mr-1" /> : 
                <TrendDownIcon className="w-4 h-4 mr-1" />
              }
              {Math.abs(reportData.avgSizeGrowth)}%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Conversion Rate</span>
          <div className="flex justify-between items-center">
            <span className="stat-value">{reportData.conversionRate}%</span>
            <div className={`flex items-center text-sm ${reportData.conversionGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {reportData.conversionGrowth >= 0 ? 
                <TrendUpIcon className="w-4 h-4 mr-1" /> : 
                <TrendDownIcon className="w-4 h-4 mr-1" />
              }
              {Math.abs(reportData.conversionGrowth)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Revenue over time chart */}
      <div className="p-4">
        <div className="report-card">
          <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Deal stages and sales by rep charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="report-card">
          <h3 className="text-lg font-medium mb-4">Deals by Stage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reportData.dealsByStage} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {reportData.dealsByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} deals`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-card">
          <h3 className="text-lg font-medium mb-4">Sales by Rep</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.salesByRep}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;