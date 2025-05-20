import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getIcon } from '../../utils/iconUtils';
import { fetchActivityReportData } from '../../services/ReportsService';

const ActivityReport = ({ dateRange }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const TrendUpIcon = getIcon('trending-up');
  const TrendDownIcon = getIcon('trending-down');
  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
  
  useEffect(() => {
    setIsLoading(true);
    fetchActivityReportData(dateRange)
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
    <div id="activity-report" className="report-container">
      <div className="report-header">
        <h2 className="text-xl font-bold">Activity Metrics Dashboard</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 90 days'}
        </p>
      </div>
      
      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="stat-card">
          <span className="stat-label">Total Activities</span>
          <div className="flex justify-between items-center">
            <span className="stat-value">{reportData.totalActivities}</span>
            <div className={`flex items-center text-sm ${reportData.activityGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {reportData.activityGrowth >= 0 ? 
                <TrendUpIcon className="w-4 h-4 mr-1" /> : 
                <TrendDownIcon className="w-4 h-4 mr-1" />
              }
              {Math.abs(reportData.activityGrowth)}%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <div className="flex justify-between items-center">
            <span className="stat-value">{reportData.completedActivities}</span>
            <div className="text-sm text-surface-500">
              {Math.round((reportData.completedActivities / reportData.totalActivities) * 100)}% of total
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Completion Rate</span>
          <div className="flex justify-between items-center">
            <span className="stat-value">{reportData.completionRate}%</span>
            <div className={`flex items-center text-sm ${reportData.completionGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {reportData.completionGrowth >= 0 ? 
                <TrendUpIcon className="w-4 h-4 mr-1" /> : 
                <TrendDownIcon className="w-4 h-4 mr-1" />
              }
              {Math.abs(reportData.completionGrowth)}%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">Overdue</span>
          <div className="flex justify-between items-center">
            <span className="stat-value">{reportData.overdueActivities}</span>
            <div className="text-sm text-surface-500">
              {Math.round((reportData.overdueActivities / reportData.totalActivities) * 100)}% of total
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity Trend Chart */}
      <div className="p-4">
        <div className="report-card">
          <h3 className="text-lg font-medium mb-4">Activity Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.activityTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total Activities" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Activity Types & Rep Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="report-card">
          <h3 className="text-lg font-medium mb-4">Activities by Type</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reportData.activitiesByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {reportData.activitiesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} activities`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="report-card">
          <h3 className="text-lg font-medium mb-4">Activities by Rep</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.activitiesByRep}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" />
                <Bar dataKey="overdue" name="Overdue" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityReport;