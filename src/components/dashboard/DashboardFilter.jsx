import { useState } from 'react';
import { getIcon } from '../../utils/iconUtils';

const DashboardFilter = ({ 
  timeframe, 
  setTimeframe, 
  teamFilter, 
  setTeamFilter, 
  regionFilter,
  setRegionFilter,
  productFilter,
  setProductFilter,
  darkMode,
  isLoading
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // Icons
  const CalendarIcon = getIcon('calendar');
  const ChevronDownIcon = getIcon('chevron-down');
  const UsersIcon = getIcon('users');
  const MapPinIcon = getIcon('map-pin');
  const PackageIcon = getIcon('package');
  const FilterIcon = getIcon('filter');
  const ChevronUpIcon = getIcon('chevron-up');
  
  // Sample data for filters
  const teams = [
    { id: 'all', name: 'All Teams' },
    { id: 'sales-team', name: 'Sales Team' },
    { id: 'support-team', name: 'Support Team' },
    { id: 'marketing-team', name: 'Marketing Team' },
    { id: 'account-managers', name: 'Account Managers' }
  ];
  
  const regions = [
    { id: 'all', name: 'All Regions' },
    { id: 'north-america', name: 'North America' },
    { id: 'europe', name: 'Europe' },
    { id: 'asia-pacific', name: 'Asia-Pacific' },
    { id: 'latin-america', name: 'Latin America' }
  ];
  
  const products = [
    { id: 'all', name: 'All Products' },
    { id: 'software', name: 'Software Solutions' },
    { id: 'hardware', name: 'Hardware Products' },
    { id: 'services', name: 'Professional Services' },
    { id: 'training', name: 'Training & Support' }
  ];
  
  const timeframes = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' },
    { id: 'year', name: 'This Year' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const handleTimeframeChange = (value) => {
    if (!isLoading) {
      setTimeframe(value);
    }
  };

  const handleTeamChange = (value) => {
    if (!isLoading) {
      setTeamFilter(value);
    }
  };

  const handleRegionChange = (value) => {
    if (!isLoading) {
      setRegionFilter(value);
    }
  };

  const handleProductChange = (value) => {
    if (!isLoading) {
      setProductFilter(value);
    }
  };

  return (
    <div className="card bg-white dark:bg-surface-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <select
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="input-field pl-10 pr-10 py-1.5 appearance-none"
              disabled={isLoading}
            >
              {timeframes.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 pointer-events-none">
              <ChevronDownIcon className="w-4 h-4" />
            </div>
          </div>
          
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="flex items-center gap-2 py-2 px-3 bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-600 transition-colors"
            aria-expanded={isFilterExpanded}
            disabled={isLoading}
          >
            <FilterIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {isFilterExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="text-sm text-surface-500 dark:text-surface-400">
          Showing data for: <span className="font-medium text-surface-700 dark:text-surface-300">
            {timeframes.find(t => t.id === timeframe)?.name}
          </span>
        </div>
      </div>
      
      {isFilterExpanded && (
        <div className="mt-5 pt-5 border-t border-surface-200 dark:border-surface-700 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
              <UsersIcon className="w-4 h-4" />
            </div>
            <select
              value={teamFilter}
              onChange={(e) => handleTeamChange(e.target.value)}
              className="input-field pl-10 pr-10 appearance-none"
              disabled={isLoading}
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 pointer-events-none">
              <ChevronDownIcon className="w-4 h-4" />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
              <MapPinIcon className="w-4 h-4" />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="input-field pl-10 pr-10 appearance-none"
              disabled={isLoading}
            >
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 pointer-events-none">
              <ChevronDownIcon className="w-4 h-4" />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
              <PackageIcon className="w-4 h-4" />
            </div>
            <select
              value={productFilter}
              onChange={(e) => handleProductChange(e.target.value)}
              className="input-field pl-10 pr-10 appearance-none"
              disabled={isLoading}
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 pointer-events-none">
              <ChevronDownIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilter;