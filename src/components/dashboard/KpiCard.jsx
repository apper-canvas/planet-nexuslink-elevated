import { motion } from 'framer-motion';
import { getIcon } from '../../utils/iconUtils';

const KpiCard = ({ title, value, trend, icon: Icon, isLoading }) => {
  const TrendUpIcon = getIcon('trending-up');
  const TrendDownIcon = getIcon('trending-down');
  
  // Format the trend with plus sign for positive values
  const formattedTrend = trend > 0 ? `+${trend}%` : `${trend}%`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card bg-white dark:bg-surface-800"
    >
      {isLoading ? (
        <div className="animate-pulse flex flex-col h-full">
          <div className="h-5 w-1/2 bg-surface-200 dark:bg-surface-700 rounded mb-4"></div>
          <div className="h-8 w-3/4 bg-surface-200 dark:bg-surface-700 rounded mb-2"></div>
          <div className="h-4 w-1/3 bg-surface-200 dark:bg-surface-700 rounded mt-auto"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</h3>
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold mb-2">{value}</div>
          <div className={`flex items-center text-xs font-medium ${
            trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-surface-500'
          }`}>
            {trend !== 0 && (trend > 0 ? <TrendUpIcon className="w-3 h-3 mr-1" /> : <TrendDownIcon className="w-3 h-3 mr-1" />)}
            <span>{formattedTrend} vs previous {title.includes('Rate') ? 'period' : 'period'}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default KpiCard;