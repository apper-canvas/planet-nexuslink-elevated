import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import SalesReport from './SalesReport';
import ActivityReport from './ActivityReport';
import ReportFilter from './ReportFilter';
import { exportToPDF, exportToCSV } from '../../utils/exportUtils';

const ReportsModule = ({ darkMode, currentUser }) => {
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  
  // Icons
  const DownloadIcon = getIcon('download');
  const RefreshIcon = getIcon('refresh-cw');
  const DollarSignIcon = getIcon('dollar-sign');
  const ActivityIcon = getIcon('activity');
  const UsersIcon = getIcon('users');
  const MailIcon = getIcon('mail');
  
  const reports = [
    { id: 'sales', label: 'Sales Performance', icon: DollarSignIcon },
    { id: 'activity', label: 'Activity Metrics', icon: ActivityIcon },
    { id: 'contacts', label: 'Contact Growth', icon: UsersIcon },
    { id: 'email', label: 'Email Analytics', icon: MailIcon },
  ];
  
  const handleExport = (format) => {
    setIsExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      if (format === 'pdf') {
        exportToPDF(`${activeReport}-report`);
        toast.success('Report exported as PDF successfully');
      } else {
        exportToCSV(`${activeReport}-report-data`, `${activeReport}_report`);
        toast.success('Report exported as CSV successfully');
      }
      setIsExporting(false);
    }, 1000);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports &amp; Analytics</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="btn-secondary flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export as PDF'}
          </button>
          <button 
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="btn-secondary flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export as CSV'}
          </button>
        </div>
      </div>
      
      <ReportFilter reports={reports} activeReport={activeReport} setActiveReport={setActiveReport} dateRange={dateRange} setDateRange={setDateRange} />
      
      {activeReport === 'sales' ? <SalesReport dateRange={dateRange} /> : activeReport === 'activity' ? <ActivityReport dateRange={dateRange} /> : <div className="report-container p-8 text-center">This report type is coming soon!</div>}
    </motion.div>
  );
};

export default ReportsModule;