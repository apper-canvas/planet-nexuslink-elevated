import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { getFileExtension, getFileTypeIcon, getFileTypeLabel } from '../../utils/exportUtils';
import { getDocumentCategories, getDocumentCategoryLabel, formatFileSize } from '../../utils/documentUtils';
import DocumentVersionHistory from './DocumentVersionHistory';
import DocumentStorage from '../../services/DocumentStorage';

const DocumentList = ({ documents = [], onView, onDelete, onDownload, contactId, searchTerm = '' }) => {
  const [filteredDocs, setFilteredDocs] = useState(documents);
  const [sortConfig, setSortConfig] = useState({ key: 'uploadedAt', direction: 'desc' });
  const [showVersionHistory, setShowVersionHistory] = useState(null);
  const [actionMenuDoc, setActionMenuDoc] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Icons
  const GridIcon = getIcon('grid');
  const ListIcon = getIcon('list');
  const SortAscIcon = getIcon('arrow-up');
  const SortDescIcon = getIcon('arrow-down');
  const EyeIcon = getIcon('eye');
  const DownloadIcon = getIcon('download');
  const TrashIcon = getIcon('trash');
  const HistoryIcon = getIcon('history');
  const MoreVerticalIcon = getIcon('more-vertical');
  const CloseIcon = getIcon('x');

  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Filter documents based on search term
    let docs = [...documents];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      docs = docs.filter(doc => 
        doc.filename?.toLowerCase().includes(term) || 
        doc.description?.toLowerCase().includes(term) || 
        doc.type?.toLowerCase().includes(term) ||
        getDocumentCategoryLabel(doc.type)?.toLowerCase().includes(term)
      );
    }
    
    if (categoryFilter !== 'all') {
      docs = docs.filter(doc => 
        doc.type === categoryFilter
      );
    }
    
    // Apply sorting
    docs.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredDocs(docs);
  }, [documents, searchTerm, sortConfig, categoryFilter]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleView = (doc) => {
    if (onView) onView(doc);
    setActionMenuDoc(null);
  };

  const handleDelete = (docId) => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      if (onDelete) onDelete(docId);
      
      // Delete from storage service
      const result = DocumentStorage.deleteDocument(docId);
      if (result) {
        toast.success('Document deleted successfully');
      } else {
        toast.error('Failed to delete document');
      }
    }
    setActionMenuDoc(null); 
  };

  const handleDownload = (doc) => {
    if (onDownload) onDownload(doc);
    toast.info(`Downloading ${doc.filename}`);
    setActionMenuDoc(null);
  };

  const handleShowVersionHistory = (doc) => {
    setShowVersionHistory(doc);
    setActionMenuDoc(null);
  };

  const toggleActionMenu = (docId) => {
    setActionMenuDoc(actionMenuDoc === docId ? null : docId);
  };

  const getDocumentTypeColor = (filename) => {
    const ext = getFileExtension(filename);
    
    switch (ext) {
      case 'pdf':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'doc':
      case 'docx':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'xls':
      case 'xlsx':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'ppt':
      case 'pptx':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Render empty state when no documents
  if (filteredDocs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-surface-500">
        <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
          {/* Get file icon component */}
          {(() => { const FileIcon = getIcon('file'); return <FileIcon className="w-8 h-8 text-surface-400" />; })()}
          <FileIcon className="w-8 h-8 text-surface-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No documents found</h3>
        <p className="text-center max-w-md mb-6">
          {searchTerm 
            ? `No documents match "${searchTerm}"`
            : "Upload documents to this contact to keep track of important files."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Document list toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field py-1.5 pl-3 pr-8 text-sm"
            >
              <option value="all">All Categories</option>
              {getDocumentCategories().map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {getIcon('chevron-down')({className: "w-4 h-4 text-surface-500"})}
            </div>
          </div>
          
          <div className="text-sm text-surface-500 whitespace-nowrap">
            {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => handleSort('type')}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
          >
            Category
            {sortConfig.key === 'type' && (
              sortConfig.direction === 'asc' ? <SortAscIcon className="w-3 h-3" /> : <SortDescIcon className="w-3 h-3" />
            )}
          </button>
          
          <button
            onClick={() => handleSort('filename')}
            title="Sort by filename"
            className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
          >
            Name
            {sortConfig.key === 'filename' && (
              sortConfig.direction === 'asc' ? <SortAscIcon className="w-3 h-3" /> : <SortDescIcon className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('uploadedAt')}
            title="Sort by upload date"
            className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
          >
            Date
            {sortConfig.key === 'uploadedAt' && (
              sortConfig.direction === 'asc' ? <SortAscIcon className="w-3 h-3" /> : <SortDescIcon className="w-3 h-3" />
            )}
          </button>
          <div className="h-5 w-px bg-surface-300 dark:bg-surface-600 mx-1"></div>
          
          <button
            onClick={() => setViewMode('grid')}
            title="Grid view"
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-surface-200 dark:bg-surface-700' : 'hover:bg-surface-100 dark:hover:bg-surface-700'}`}
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-surface-200 dark:bg-surface-700' : 'hover:bg-surface-100 dark:hover:bg-surface-700'}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const FileIcon = getIcon(getFileTypeIcon(doc.filename));
            const typeColor = getDocumentTypeColor(doc.filename);
            
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="document-card group relative"
              >
                <div className="document-preview relative" onClick={() => handleView(doc)}>
                  <FileIcon className="w-12 h-12 text-surface-400" />
                  {doc.version > 1 && (
                    <span className="document-version-badge absolute top-2 right-2">v{doc.version}</span>
                  )}
                </div>
                <div className="p-3">
                  <span className={`document-type-badge ${typeColor}`}>
                    {getFileTypeLabel(doc.filename)}
                  </span>
                  <span className="document-type-badge bg-primary/10 text-primary ml-1">
                    {getDocumentCategoryLabel(doc.type)}
                  </span>
                  <h3 className="font-medium mt-2 truncate" title={doc.filename}>{doc.filename}</h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                    Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="document-card-footer flex justify-between items-center">
                  <span className="text-xs text-surface-500">{formatFileSize(doc.size)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleView(doc)}
                      className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300"
                      title="View document"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300"
                      title="Download document"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => toggleActionMenu(doc.id)}
                        className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300"
                        title="More options"
                      >
                        <MoreVerticalIcon className="w-4 h-4" />
                      </button>
                      
                      {actionMenuDoc === doc.id && (
                        <div className="document-actions-dropdown">
                          <button
                            onClick={() => handleShowVersionHistory(doc)}
                            className="w-full text-left px-3 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                          >
                            <HistoryIcon className="w-4 h-4" />
                            <span>Version History</span>
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                          >
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-100 dark:bg-surface-800 text-left text-xs">
              <tr>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium text-sm">Document</th>
                <th className="px-4 py-2 font-medium text-sm hidden sm:table-cell">Uploaded by</th>
                <th className="px-4 py-2 font-medium text-sm hidden md:table-cell">Date</th>
                <th className="px-4 py-2 font-medium text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const FileIcon = getIcon(getFileTypeIcon(doc.filename));
                const typeColor = getDocumentTypeColor(doc.filename);
                
                return (
                  <tr key={doc.id} className="border-t border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800">
                    <td className="px-4 py-3">{getDocumentCategoryLabel(doc.type)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileIcon className="w-8 h-8 text-surface-400 flex-shrink-0" />
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{doc.filename}</span>
                            {doc.version > 1 && (
                              <span className="document-version-badge ml-2">v{doc.version}</span>
                            )}
                          </div>
                          <span className={`document-type-badge ${typeColor} mt-1`}>
                            {getFileTypeLabel(doc.filename)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400 hidden sm:table-cell">
                      {doc.uploadedBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-400 hidden md:table-cell">
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleView(doc)}
                          className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300"
                          title="View document"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300"
                          title="Download document"
                        >
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShowVersionHistory(doc)}
                          className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300"
                          title="Version history"
                        >
                          <HistoryIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                          title="Delete document"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Version History Modal */}
      <AnimatePresence>
        {showVersionHistory && (
          <DocumentVersionHistory 
            document={showVersionHistory} 
            onClose={() => setShowVersionHistory(null)}
            onView={handleView}
            onRevert={(version) => {
              toast.success(`Reverted to version ${version}`);
              setShowVersionHistory(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentList;