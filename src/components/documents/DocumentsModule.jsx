import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import DocumentList from './DocumentList';
import DocumentUploader from './DocumentUploader';
import DocumentViewer from './DocumentViewer';
import DocumentStorage from '../../services/DocumentStorage';

const DocumentsModule = ({ darkMode, currentUser }) => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'uploadedAt', direction: 'desc' });

  // Icons
  const SearchIcon = getIcon('search');
  const PlusIcon = getIcon('plus');
  const UsersIcon = getIcon('users');
  const FolderIcon = getIcon('folder');
  const UploadIcon = getIcon('upload');
  const FileIcon = getIcon('file-text');
  const XIcon = getIcon('x');
  const SortAscIcon = getIcon('arrow-up');
  const SortDescIcon = getIcon('arrow-down');
  const ChevronDownIcon = getIcon('chevron-down');

  // Load documents and contacts on mount
  useEffect(() => {
    loadDocuments();
    loadContacts();
  }, []);

  const loadDocuments = () => {
    const allDocuments = DocumentStorage.loadDocuments();
    setDocuments(allDocuments);
  };

  const loadContacts = () => {
    try {
      const savedContacts = localStorage.getItem('crm-contacts');
      if (savedContacts) {
        const contactsList = JSON.parse(savedContacts);
        setContacts(contactsList);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    }
  };

  const handleAddDocument = (newDocument) => {
    // Reload documents to ensure we have the latest data
    loadDocuments();
    setIsUploadingDocument(false);
    toast.success(`Document "${newDocument.filename}" uploaded successfully`);
  };

  const handleDeleteDocument = (documentId) => {
    // Delete from storage service
    const result = DocumentStorage.deleteDocument(documentId);
    if (result) {
      toast.success('Document deleted successfully');
      loadDocuments(); // Reload documents after deletion
    } else {
      toast.error('Failed to delete document');
    }
  };

  const handleDownloadDocument = (doc) => {
    toast.info(`Downloading ${doc.filename}`);
    // In a real app, this would trigger an actual download
  };

  const getFilteredDocuments = () => {
    let filteredDocs = [...documents];
    
    // Apply contact filter
    if (selectedContactId) {
      filteredDocs = filteredDocs.filter(doc => doc.contactId === selectedContactId);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.type === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredDocs = filteredDocs.filter(doc =>
        doc.filename?.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        getContactName(doc.contactId)?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    filteredDocs.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return filteredDocs;
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredDocuments = getFilteredDocuments();
  
  return (
    <div className="h-full">
      <div className="flex flex-col h-full space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Documents</h2>
            <button 
              onClick={() => setIsUploadingDocument(!isUploadingDocument)}
              className="btn-primary flex items-center gap-2"
            >
              {isUploadingDocument ? (
                <>
                  <XIcon className="w-4 h-4" />
                  <span>Cancel Upload</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
                  <UsersIcon className="w-4 h-4" />
                </div>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="input-field pl-10 appearance-none pr-10"
                >
                  <option value="">All Contacts</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 pointer-events-none">
                  <ChevronDownIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Document Uploader */}
          {isUploadingDocument && (
            <div className="mb-6 animate-upload border border-surface-200 dark:border-surface-700 rounded-lg p-4 bg-surface-50 dark:bg-surface-800">
              <h3 className="font-medium mb-2">Upload New Document</h3>
              <DocumentUploader 
                onUpload={handleAddDocument}
                contactId={selectedContactId || null}
                showContactSelect={!selectedContactId}
                contacts={contacts}
                currentUser={currentUser || 'Current User'}
              />
            </div>
          )}
          
          {/* Document List */}
          <div className="overflow-hidden">
            <DocumentList 
              documents={filteredDocuments}
              onView={setViewingDocument}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
              searchTerm={searchTerm}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer document={viewingDocument} onClose={() => setViewingDocument(null)} />
      )}
    </div>
  );
};

export default DocumentsModule;