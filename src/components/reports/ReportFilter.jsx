import { getIcon } from '../../utils/iconUtils';

const ReportFilter = ({ reports, activeReport, setActiveReport, dateRange, setDateRange }) => {
  const CalendarIcon = getIcon('calendar');
  
  const handleReportChange = (reportId) => {
    setActiveReport(reportId);
  };
  
  return (
    <div className="report-container mb-6">
      {/* Report type navigation */}
      <div className="p-3 border-b border-surface-200 dark:border-surface-700 overflow-x-auto">
        <div className="flex space-x-2">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => handleReportChange(report.id)}
              className={`report-nav-item flex items-center gap-2 ${
                activeReport === report.id
                  ? 'report-nav-item-active'
                  : 'report-nav-item-inactive'
              }`}
            >
              <report.icon className="w-4 h-4" />
              <span>{report.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Date range and additional filters */}
      <div className="p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <label className="text-sm text-surface-600 dark:text-surface-400 flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" /> Date Range:
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field text-sm py-1 px-3"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last 12 months</option>
          </select>
        </div>
        
        <button className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};

export default ReportFilter;