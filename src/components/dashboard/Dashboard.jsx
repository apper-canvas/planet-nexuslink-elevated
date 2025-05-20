import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getIcon } from '../../utils/iconUtils';
import DashboardFilter from './DashboardFilter';
import KpiCard from './KpiCard';
import ChartContainer from './ChartContainer';
import { 
  generateSalesData, 
  generateTeamData, 
  generateCustomerData,
  calculateKpiMetrics
} from '../../utils/dashboardData';

const Dashboard = ({ darkMode }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('sales');
  const [timeframe, setTimeframe] = useState('month');
  const [teamFilter, setTeamFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [salesData, setSalesData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [kpiMetrics, setKpiMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Icons
  const DashboardIcon = getIcon('layout-dashboard');
  const UsersIcon = getIcon('users');
  const DollarSignIcon = getIcon('dollar-sign');
  const CalendarIcon = getIcon('calendar');
  const MailIcon = getIcon('mail');
  const BarChartIcon = getIcon('bar-chart-2');
  const SettingsIcon = getIcon('settings');
  const ArrowLeftIcon = getIcon('arrow-left');
  const DownloadIcon = getIcon('download');
  const RefreshIcon = getIcon('refresh-cw');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { id: 'contacts', label: 'Contacts', icon: UsersIcon },
    { id: 'deals', label: 'Deals', icon: DollarSignIcon },
    { id: 'activities', label: 'Activities', icon: CalendarIcon },
    { id: 'email', label: 'Email', icon: MailIcon },
    { id: 'reports', label: 'Reports', icon: BarChartIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleTabChange = (tabId) => {
    // Special handling for navigation items with paths
    const item = navigationItems.find(item => item.id === tabId);
    if (item && item.path) {
      return; // Already on dashboard
    } else if (tabId === 'contacts') {
      navigate('/');
    } else {
      toast.info(`${tabId.charAt(0).toUpperCase() + tabId.slice(1)} feature will be available in the next release.`);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API loading time
    setTimeout(() => {
      const data = {
        sales: generateSalesData(timeframe, regionFilter, teamFilter, productFilter),
        team: generateTeamData(timeframe, regionFilter, teamFilter),
        customer: generateCustomerData(timeframe, regionFilter, productFilter)
      };
      
      setSalesData(data.sales);
      setTeamData(data.team);
      setCustomerData(data.customer);
      setKpiMetrics(calculateKpiMetrics(data));
      setIsLoading(false);
    }, 600);
  }, [timeframe, teamFilter, regionFilter, productFilter]);

  const refreshData = () => {
    setIsLoading(true);
    toast.info("Refreshing dashboard data...");
    
    setTimeout(() => {
      const data = {
        sales: generateSalesData(timeframe, regionFilter, teamFilter, productFilter),
        team: generateTeamData(timeframe, regionFilter, teamFilter),
        customer: generateCustomerData(timeframe, regionFilter, productFilter)
      };
      
      setSalesData(data.sales);
      setTeamData(data.team);
      setCustomerData(data.customer);
      setKpiMetrics(calculateKpiMetrics(data));
      setIsLoading(false);
      toast.success("Dashboard data updated successfully!");
    }, 800);
  };

  // Chart configurations
  const salesChartConfig = {
    options: {
      chart: {
        type: 'bar',
        toolbar: {
          show: false
        },
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        foreColor: darkMode ? '#94a3b8' : '#64748b',
        background: 'transparent'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        },
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#3b82f6', '#f43f5e'],
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: salesData.map(item => item.period),
        axisBorder: {
          show: false
        }
      },
      yaxis: {
        title: {
          text: '$ (thousands)'
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        theme: darkMode ? 'dark' : 'light',
        y: {
          formatter: function (val) {
            return "$ " + val + " thousands"
          }
        }
      },
      legend: {
        position: 'top'
      },
      grid: {
        borderColor: darkMode ? '#334155' : '#e2e8f0',
        strokeDashArray: 4
      },
      theme: {
        mode: darkMode ? 'dark' : 'light'
      }
    },
    series: [
      {
        name: 'Revenue',
        data: salesData.map(item => item.revenue)
      },
      {
        name: 'Profit',
        data: salesData.map(item => item.profit)
      }
    ]
  };

  const teamPerformanceConfig = {
    options: {
      chart: {
        type: 'line',
        toolbar: {
          show: false
        },
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        foreColor: darkMode ? '#94a3b8' : '#64748b',
        background: 'transparent'
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      colors: ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b'],
      markers: {
        size: 4,
        strokeWidth: 0
      },
      xaxis: {
        categories: teamData.length > 0 ? teamData[0].data.map(item => item.period) : []
      },
      grid: {
        borderColor: darkMode ? '#334155' : '#e2e8f0',
        strokeDashArray: 4
      },
      tooltip: {
        theme: darkMode ? 'dark' : 'light'
      },
      legend: {
        position: 'top'
      },
      theme: {
        mode: darkMode ? 'dark' : 'light'
      }
    },
    series: teamData.map(member => ({
      name: member.name,
      data: member.data.map(item => item.deals)
    }))
  };

  const customerDistributionConfig = {
    options: {
      chart: {
        type: 'pie',
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        foreColor: darkMode ? '#94a3b8' : '#64748b',
        background: 'transparent'
      },
      labels: customerData.map(item => item.segment),
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'],
      legend: {
        position: 'bottom'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      tooltip: {
        theme: darkMode ? 'dark' : 'light'
      },
      theme: {
        mode: darkMode ? 'dark' : 'light'
      }
    },
    series: customerData.map(item => item.value)
  };
  
  const customerEngagementConfig = {
    options: {
      chart: {
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false
        },
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        foreColor: darkMode ? '#94a3b8' : '#64748b',
        background: 'transparent'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4
        },
      },
      xaxis: {
        categories: customerData.map(item => item.segment),
      },
      yaxis: {
        title: {
          text: 'Interactions'
        }
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: 'top'
      },
      colors: ['#3b82f6', '#10b981', '#f59e0b'],
      grid: {
        borderColor: darkMode ? '#334155' : '#e2e8f0',
        strokeDashArray: 4
      },
      tooltip: {
        theme: darkMode ? 'dark' : 'light'
      },
      theme: {
        mode: darkMode ? 'dark' : 'light'
      }
    },
    series: [
      {
        name: 'Emails',
        data: customerData.map(item => item.emails || Math.floor(Math.random() * 50) + 20)
      },
      {
        name: 'Calls',
        data: customerData.map(item => item.calls || Math.floor(Math.random() * 30) + 10)
      },
      {
        name: 'Meetings',
        data: customerData.map(item => item.meetings || Math.floor(Math.random() * 15) + 5)
      }
    ]
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Sidebar Navigation */}
      <nav className="hidden md:flex flex-col w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  item.id === 'dashboard'
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-10 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
        <div className="flex justify-around">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center py-3 px-2 ${
                item.id === 'dashboard'
                  ? 'text-primary'
                  : 'text-surface-600 dark:text-surface-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
        <div className="flex flex-col gap-6">
          {/* Dashboard Header & Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Performance Dashboard</h1>
                <p className="text-surface-500 dark:text-surface-400">
                  {format(new Date(), 'MMMM d, yyyy')} • Last updated {format(new Date(), 'h:mm a')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button 
                onClick={refreshData}
                className="btn-secondary flex items-center gap-2 py-1.5"
                disabled={isLoading}
              >
                <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <DashboardFilter 
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            teamFilter={teamFilter}
            setTeamFilter={setTeamFilter}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            productFilter={productFilter}
            setProductFilter={setProductFilter}
            darkMode={darkMode}
            isLoading={isLoading}
          />
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard 
              title="Total Revenue" 
              value={kpiMetrics.totalRevenue || '$0'}
              trend={kpiMetrics.revenueTrend || 0}
              icon={DollarSignIcon}
              isLoading={isLoading}
            />
            <KpiCard 
              title="New Deals" 
              value={kpiMetrics.totalDeals || 0}
              trend={kpiMetrics.dealsTrend || 0}
              icon={getIcon('briefcase')}
              isLoading={isLoading}
            />
            <KpiCard 
              title="Customer Interactions" 
              value={kpiMetrics.totalInteractions || 0}
              trend={kpiMetrics.interactionsTrend || 0}
              icon={getIcon('message-circle')}
              isLoading={isLoading}
            />
            <KpiCard 
              title="Conversion Rate" 
              value={kpiMetrics.conversionRate || '0%'}
              trend={kpiMetrics.conversionTrend || 0}
              icon={getIcon('percent')}
              isLoading={isLoading}
            />
          </div>
          
          {/* Dashboard View Tabs */}
          <div className="border-b border-surface-200 dark:border-surface-700">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveView('sales')}
                className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                  activeView === 'sales'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                Sales Performance
              </button>
              <button
                onClick={() => setActiveView('team')}
                className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                  activeView === 'team'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                Team Performance
              </button>
              <button
                onClick={() => setActiveView('customer')}
                className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                  activeView === 'customer'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                Customer Insights
              </button>
            </div>
          </div>
          
          {/* Dashboard Charts */}
          <div className="space-y-6">
            {activeView === 'sales' && (
              <>
                <ChartContainer 
                  title="Revenue vs Profit"
                  description="Monthly comparison of revenue and profit figures"
                  chart={<Chart 
                    options={salesChartConfig.options} 
                    series={salesChartConfig.series} 
                    type="bar" 
                    height={350}
                  />}
                  data={salesData}
                  fileName="sales_performance"
                  isLoading={isLoading}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer 
                    title="Sales by Region"
                    description="Distribution of sales across different regions"
                    chart={<Chart 
                      options={customerDistributionConfig.options}
                      series={customerDistributionConfig.series}
                      type="pie"
                      height={300}
                    />}
                    data={customerData}
                    fileName="sales_by_region"
                    isLoading={isLoading}
                  />
                  
                  <ChartContainer 
                    title="Product Performance"
                    description="Comparison of different product lines"
                    chart={<Chart 
                      options={customerEngagementConfig.options}
                      series={customerEngagementConfig.series}
                      type="bar"
                      height={300}
                    />}
                    data={customerData}
                    fileName="product_performance"
                    isLoading={isLoading}
                  />
                </div>
              </>
            )}
            
            {activeView === 'team' && (
              <>
                <ChartContainer 
                  title="Team Performance Trends"
                  description="Deal closure rate by team member over time"
                  chart={<Chart 
                    options={teamPerformanceConfig.options} 
                    series={teamPerformanceConfig.series} 
                    type="line" 
                    height={350} 
                  />}
                  data={teamData}
                  fileName="team_performance"
                  isLoading={isLoading}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer 
                    title="Team Efficiency"
                    description="Deals closed compared to time invested"
                    chart={<Chart 
                      options={{
                        ...salesChartConfig.options,
                        xaxis: {
                          categories: teamData.map(item => item.name),
                        },
                      }}
                      series={[{
                        name: 'Efficiency Score',
                        data: teamData.map(item => 
                          (item.data.reduce((sum, period) => sum + period.deals, 0) / 
                          item.data.length).toFixed(1)
                        )
                      }]}
                      type="bar"
                      height={300}
                    />}
                    data={teamData}
                    fileName="team_efficiency"
                    isLoading={isLoading}
                  />
                  
                  <ChartContainer 
                    title="Deals by Team Member"
                    description="Total deals closed by each team member"
                    chart={<Chart 
                      options={{
                        ...customerDistributionConfig.options,
                        labels: teamData.map(item => item.name),
                      }}
                      series={teamData.map(item => 
                        item.data.reduce((sum, period) => sum + period.deals, 0)
                      )}
                      type="pie"
                      height={300}
                    />}
                    data={teamData.map(item => ({
                      name: item.name,
                      deals: item.data.reduce((sum, period) => sum + period.deals, 0)
                    }))}
                    fileName="deals_by_team"
                    isLoading={isLoading}
                  />
                </div>
              </>
            )}
            
            {activeView === 'customer' && (
              <>
                <ChartContainer 
                  title="Customer Interactions"
                  description="Communication channels used with customers"
                  chart={<Chart 
                    options={customerEngagementConfig.options} 
                    series={customerEngagementConfig.series} 
                    type="bar" 
                    height={350} 
                  />}
                  data={customerData}
                  fileName="customer_interactions"
                  isLoading={isLoading}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer 
                    title="Customer Segments"
                    description="Distribution of customers by segment"
                    chart={<Chart 
                      options={customerDistributionConfig.options}
                      series={customerDistributionConfig.series}
                      type="pie"
                      height={300}
                    />}
                    data={customerData}
                    fileName="customer_segments"
                    isLoading={isLoading}
                  />
                  
                  <ChartContainer 
                    title="Customer Growth"
                    description="New customers added over time"
                    chart={<Chart 
                      options={{
                        ...salesChartConfig.options,
                        colors: ['#10b981'],
                      }}
                      series={[{
                        name: 'New Customers',
                        data: salesData.map(item => item.newCustomers || Math.floor(Math.random() * 20) + 5)
                      }]}
                      type="bar"
                      height={300}
                    />}
                    data={salesData}
                    fileName="customer_growth"
                    isLoading={isLoading}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;