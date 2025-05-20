import { useState } from 'react';
import { getIcon } from '../../utils/iconUtils';
import { exportToCsv } from '../../utils/exportUtils';
import { toast } from 'react-toastify';

const ChartContainer = ({ title, description, chart, data, fileName, isLoading }) => {
  const DownloadIcon = getIcon('download');
  const InfoIcon = getIcon('info');
  
  const handleExport = () => {
    try {
      exportToCsv(data, `${fileName}_${new Date().toISOString().split('T')[0]}`);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report.');
      console.error('Export error:', error);
    }
  };
  
  return (
    <div className="card bg-white dark:bg-surface-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400">{description}</p>
        </div>
        
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center gap-2 py-1.5 mt-3 sm:mt-0"
          disabled={isLoading}
        >
          <DownloadIcon className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse flex flex-col items-center justify-center h-64">
          <div className="h-10 w-10 bg-surface-200 dark:bg-surface-700 rounded-full mb-4"></div>
          <div className="h-4 w-1/3 bg-surface-200 dark:bg-surface-700 rounded"></div>
        </div>
      ) : (
        chart
      )}
    </div>
  );
};

export default ChartContainer;