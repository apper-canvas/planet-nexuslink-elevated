import { motion } from 'framer-motion';
import { getIcon } from '../../utils/iconUtils';

const DocumentVersionHistory = ({ document, onClose, onView, onRevert }) => {
  // Icons
  const XIcon = getIcon('x');
  const EyeIcon = getIcon('eye');
  const RewindIcon = getIcon('rewind');
  const ClockIcon = getIcon('clock');
  const RefreshCwIcon = getIcon('refresh-cw');
  
  // Generate mock version history if not provided
  // In a real app, this would come from the server
  const versions = document.versions || generateMockVersions(document);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-surface-800 rounded-xl shadow-soft w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-semibold">Version History</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <h3 className="font-medium mb-2">{document.filename}</h3>
          
          {versions.length === 0 ? (
            <p className="text-surface-500 py-4 text-center">No version history available</p>
          ) : (
            <ul className="space-y-1 mt-4">
              {versions.map((version) => (
                <li key={version.id} className="document-version-item">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">Version {version.version}</span>
                      {version.current && (
                        <span className="ml-2 text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                      {version.modifiedBy} • {new Date(version.modifiedAt).toLocaleString()}
                    </div>
                    {version.changes && (
                      <div className="text-xs text-surface-600 dark:text-surface-400 mt-1">
                        {version.changes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onView(version)}
                      className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
                      title="View this version"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {!version.current && (
                      <button
                        onClick={() => onRevert(version.version)}
                        className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400"
                        title="Revert to this version"
                      >
                        <RefreshCwIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Generate mock version history for demonstration
const generateMockVersions = (document) => {
  const currentVersion = document.version || 1;
  if (currentVersion === 1) {
    return [{
      id: `${document.id}-v1`,
      version: 1,
      filename: document.filename,
      modifiedBy: document.uploadedBy,
      modifiedAt: document.uploadedAt,
      current: true,
      changes: 'Initial document upload'
    }];
  }
  
  const versions = [];
  const now = new Date();
  
  for (let i = currentVersion; i >= 1; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (currentVersion - i) * 2);
    
    versions.push({
      id: `${document.id}-v${i}`,
      version: i,
      filename: document.filename,
      modifiedBy: i === 1 ? document.uploadedBy : 'Team Member',
      modifiedAt: date.toISOString(),
      current: i === currentVersion,
      changes: i === 1 
        ? 'Initial document upload' 
        : `Updated content and formatting (Version ${i})`
    });
  }
  
  return versions;
};

export default DocumentVersionHistory;