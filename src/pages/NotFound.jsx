import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const NotFound = () => {
  const AlertCircleIcon = getIcon('alert-circle');
  const ArrowLeftIcon = getIcon('arrow-left');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[70vh] flex flex-col items-center justify-center p-4"
    >
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <AlertCircleIcon className="w-16 h-16 text-accent" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or return to the homepage.
        </p>
        
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;