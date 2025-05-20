import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import NotesSection from './notes/NotesSection';
import DocumentList from './documents/DocumentList';
import DocumentUploader from './documents/DocumentUploader';
import DocumentViewer from './documents/DocumentViewer';

// Sample initial data for the CRM
const initialContacts = [
  {
    id: "1",
    name: "Sarah Johnson",
    company: "Innovatech Solutions",
    position: "Marketing Director",
    email: "sarah.j@innovatech.com",
    phone: "555-123-4567",
    tags: ["client", "tech", "marketing"],
    status: "active",
    lastContact: "2023-06-15",
    notes: [
      {
        id: "note1",
        text: "Had a great call about Q3 marketing campaign.",
        author: "Current User",
        timestamp: "2023-06-15T15:30:00",
        mentions: []
      }
    ],
    activities: [],
    teamMembers: ["Current User", "David Lee", "Maria Rodriguez"],
    documents: [
      {
        id: "doc1",
        filename: "Q3_Marketing_Proposal.pdf",
        size: 2456621,
        uploadedBy: "Current User",
        uploadedAt: "2023-06-10T14:22:00",
        version: 2,
        type: "proposal",
        description: "Marketing campaign proposal for Q3"
      }
    ]
  },
  {
    id: "2",
    name: "David Chen",
    company: "Global Retail Partners",
    position: "Purchasing Manager",
    email: "d.chen@grpartners.com",
    phone: "555-987-6543",
    tags: ["prospect", "retail"],
    status: "new",
    lastContact: "2023-07-28",
    notes: [],
    teamMembers: ["Current User", "David Lee"],
    documents: []
  },
  {
    id: "3", 
    name: "Miguel Rodriguez",
    company: "Sunshine Hospitality Group",
    position: "Operations Director",
    email: "mrodriguez@sunshine-hosp.com",
    phone: "555-456-7890",
    tags: ["client", "hospitality"],
    status: "inactive",
    lastContact: "2023-05-10",
    notes: [],
    teamMembers: ["Current User", "Maria Rodriguez", "John Smith"],
    documents: []
  }
];

const MainFeature = ({ darkMode, currentUser }) => {
  const [contacts, setContacts] = useState(() => {  
    const saved = localStorage.getItem('crm-contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [viewingDocument, setViewingDocument] = useState(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    tags: [],
    status: 'new',
    notes: [],
    teamMembers: [currentUser || 'Current User'],
    activities: []
  });
  const [newTag, setNewTag] = useState('');
  
  // Icons
  const UserPlusIcon = getIcon('user-plus');
  const SearchIcon = getIcon('search');
  const FilterIcon = getIcon('filter');
  const TagIcon = getIcon('tag');
  const CheckCircleIcon = getIcon('check-circle');
  const XCircleIcon = getIcon('x-circle');
  const ClockIcon = getIcon('clock');
  const EditIcon = getIcon('edit');
  const TrashIcon = getIcon('trash');
  const XIcon = getIcon('x');
  const PlusCircleIcon = getIcon('plus-circle');
  const BuildingIcon = getIcon('building');
  const BriefcaseIcon = getIcon('briefcase');
  const MailIcon = getIcon('mail');
  const PhoneIcon = getIcon('phone');
  const ChevronDownIcon = getIcon('chevron-down');
  const PlusIcon = getIcon('plus');
  
  const FileTextIcon = getIcon('file-text');
  const UploadIcon = getIcon('upload');
  // Save contacts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('crm-contacts', JSON.stringify(contacts));
    
    // Apply filters and search
    let results = [...contacts];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        contact => 
          contact.name.toLowerCase().includes(term) ||
          contact.company.toLowerCase().includes(term) ||
          contact.email.toLowerCase().includes(term)
      );
    }
    
    if (filterTag !== 'all') {
      results = results.filter(
        contact => contact.tags && contact.tags.includes(filterTag)
      );
    }
    
    if (filterStatus !== 'all') {
      results = results.filter(
        contact => contact.status === filterStatus
      );
    }
    
    setFilteredContacts(results);
  }, [contacts, searchTerm, filterTag, filterStatus]);
  
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };
  
  const handleAddContact = () => {
    setFormMode('add');
    setFormData({
      name: '',
      company: '',
      position: '',
      email: '',
      phone: '',
      tags: [],
      status: 'new',
      notes: [],
      teamMembers: [currentUser || 'Current User'],
      activities: []
    });
    setIsFormOpen(true);
  };
  
  const handleEditContact = () => {
    if (!selectedContact) return;
    
    setFormMode('edit');
    setFormData({
      ...selectedContact
    });
    setIsFormOpen(true);
  };
  
  const handleSubmitForm = (e) => {
    e.preventDefault();
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (formMode === 'add') {
      const newContact = {
        ...formData,
        id: Date.now().toString(),
        lastContact: currentDate,
        notes: [],
        documents: []
      };
      
      setContacts(prev => [...prev, newContact]);
      toast.success('Contact added successfully!');
    } else {
      setContacts(prev => 
        prev.map(contact => 
          contact.id === selectedContact.id 
            ? { ...formData, lastContact: currentDate } 
            : contact
        )
      );
      setSelectedContact({ ...formData, lastContact: currentDate });
      toast.success('Contact updated successfully!');
    }
    
    setIsFormOpen(false);
  };
  
  const handleDeleteContact = () => {
    if (!selectedContact) return;
    
    setContacts(prev => prev.filter(contact => contact.id !== selectedContact.id));
    setSelectedContact(null);
    toast.success('Contact deleted successfully!');
  };
  
  const handleAddNote = (contactId, noteText, mentions) => {
    const newNote = {
      id: `note-${Date.now()}`,
      text: noteText,
      author: currentUser || 'Current User',
      timestamp: new Date().toISOString(),
      mentions
    };
    
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId
          ? { 
              ...contact, 
              notes: [newNote, ...(contact.notes || [])],
              lastContact: new Date().toISOString().split('T')[0]
            }
          : contact
      )
    );
    
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact(prev => ({
        ...prev,
        notes: [newNote, ...(prev.notes || [])],
        lastContact: new Date().toISOString().split('T')[0]
      }));
    }
  };

  const handleAddDocument = (document) => {
    if (!selectedContact) return;

    // Update the selected contact with the new document
    const updatedContact = {
      ...selectedContact,
      documents: [document, ...(selectedContact.documents || [])]
    };

    // Update the contacts list
    setContacts(prev =>
      prev.map(contact =>
        contact.id === selectedContact.id ? updatedContact : contact
      )
    );

    // Update the selected contact in the UI
    setSelectedContact(updatedContact);
    setIsUploadingDocument(false);
  };

  const handleDeleteDocument = (documentId) => {
    if (!selectedContact) return;

    // Filter out the deleted document
    const updatedDocuments = selectedContact.documents.filter(doc => doc.id !== documentId);
    
    // Update the selected contact
    const updatedContact = {
      ...selectedContact,
      documents: updatedDocuments
    };

    // Update the contacts list
    setContacts(prev =>
      prev.map(contact =>
        contact.id === selectedContact.id ? updatedContact : contact
      )
    );

    setSelectedContact(updatedContact);
  };
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (!formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
    }
    
    setNewTag('');
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Get all unique tags for filtering
  const allTags = Array.from(
    new Set(contacts.flatMap(contact => contact.tags || []))
  );
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'new':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full">
      <div className="flex flex-col lg:flex-row h-full gap-6">
        {/* Left Column - Contact List */}
        <div className="flex-1 lg:max-w-md">
          <div className="card h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Contacts</h2>
              <button 
                onClick={handleAddContact}
                className="btn-primary flex items-center gap-2 py-1.5"
              >
                <UserPlusIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Add Contact</span>
              </button>
            </div>
            
            {/* Search & Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
                    <TagIcon className="w-4 h-4" />
                  </div>
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="input-field pl-10 appearance-none pr-10"
                  >
                    <option value="all">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 pointer-events-none">
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400">
                    <FilterIcon className="w-4 h-4" />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field pl-10 appearance-none pr-10"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="new">New</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 pointer-events-none">
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact List */}
            <div className="overflow-y-auto flex-grow scrollbar-hide">
              {filteredContacts.length > 0 ? (
                <ul className="space-y-2">
                  {filteredContacts.map(contact => (
                    <motion.li 
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => handleSelectContact(contact)}
                        className={`w-full text-left p-3 rounded-lg border ${
                          selectedContact?.id === contact.id
                            ? 'bg-primary/5 border-primary/30 dark:bg-primary/10'
                            : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                        } transition-colors`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{contact.name}</h3>
                            <p className="text-sm text-surface-600 dark:text-surface-400">{contact.company}</p>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(contact.status)}
                          </div>
                        </div>
                        
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {contact.tags.map(tag => (
                              <span 
                                key={tag} 
                                className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-surface-500">
                  <SearchIcon className="w-10 h-10 mb-2 opacity-30" />
                  <p>No contacts found</p>
                  <button 
                    onClick={handleAddContact}
                    className="mt-4 text-primary flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add a new contact</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Contact Details */}
        <div className="flex-1">
          <div className="card h-full">
            <AnimatePresence mode="wait">
              {selectedContact ? (
                <motion.div
                  key="contact-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* Contact header with tabs */}
                  <div className="flex flex-col mb-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold">Contact Details</h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEditContact}
                          className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                          aria-label="Edit contact"
                        >
                          <EditIcon className="w-5 h-5 text-primary" />
                        </button>
                        <button
                          onClick={handleDeleteContact}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label="Delete contact"
                        >
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contact information area */}
                  <div className="flex flex-col h-full">
                    {/* Contact profile */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-200 dark:border-surface-700">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                        {selectedContact.name.split(' ').map(name => name[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{selectedContact.name}</h3>
                        <p className="text-surface-600 dark:text-surface-400">{selectedContact.position}</p>
                      </div>
                    </div>

                    {/* Navigation tabs */}
                    <div className="border-b border-surface-200 dark:border-surface-700 mb-6">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setActiveTab('details')}
                          className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                            activeTab === 'details'
                              ? 'border-primary text-primary'
                              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                          }`}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setActiveTab('documents')}
                          className={`px-4 py-2 border-b-2 font-medium transition-colors flex items-center gap-1 ${
                            activeTab === 'documents'
                              ? 'border-primary text-primary'
                              : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                          }`}
                        >
                          Documents
                          {selectedContact.documents?.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                              {selectedContact.documents.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content area based on active tab */}
                    <div className="flex-grow overflow-y-auto pb-4">
                      {/* Details Tab */}
                      {activeTab === 'details' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-surface-500 mb-2">Contact Information</h4>
                            <ul className="space-y-3">
                              <li className="flex items-center gap-3">
                                <BuildingIcon className="w-5 h-5 text-surface-400" />
                                <span>{selectedContact.company}</span>
                              </li>
                              <li className="flex items-center gap-3">
                                <BriefcaseIcon className="w-5 h-5 text-surface-400" />
                                <span>{selectedContact.position}</span>
                              </li>
                              <li className="flex items-center gap-3">
                                <MailIcon className="w-5 h-5 text-surface-400" />
                                <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                                  {selectedContact.email}
                                </a>
                              </li>
                              <li className="flex items-center gap-3">
                                <PhoneIcon className="w-5 h-5 text-surface-400" />
                                <a href={`tel:${selectedContact.phone}`} className="text-primary hover:underline">
                                  {selectedContact.phone}
                                </a>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-surface-500 mb-2">Status</h4>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(selectedContact.status)}
                              <span className="capitalize">{selectedContact.status}</span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-surface-500 mb-2">Last Contact</h4>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-5 h-5 text-surface-400" />
                              <span>{selectedContact.lastContact}</span>
                            </div>
                          </div>
                          
                          {selectedContact.tags && selectedContact.tags.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-surface-500 mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedContact.tags.map(tag => (
                                  <span 
                                    key={tag} 
                                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Notes Section */}
                          <NotesSection 
                            contact={selectedContact} 
                            onAddNote={handleAddNote}
                            onUpdateContact={(updatedContact) => {
                              setSelectedContact(updatedContact);
                              setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
                            }}
                            currentUser={currentUser || 'Current User'}
                          />
                        </div>
                      )}

                      {/* Documents Tab */}
                      {activeTab === 'documents' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-medium text-surface-500">Document Library</h4>
                            {isUploadingDocument ? (
                              <button
                                onClick={() => setIsUploadingDocument(false)}
                                className="btn-secondary flex items-center gap-1 py-1.5 text-sm"
                              >
                                <XIcon className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setIsUploadingDocument(true)}
                                className="btn-primary flex items-center gap-1 py-1.5 text-sm"
                              >
                                <UploadIcon className="w-4 h-4" />
                                <span>Upload Document</span>
                              </button>
                            )}
                          </div>

                          {/* Document Uploader */}
                          {isUploadingDocument && (
                            <div className="mb-6 animate-upload">
                              <DocumentUploader 
                                onUpload={handleAddDocument}
                                contactId={selectedContact.id}
                                currentUser={currentUser || 'Current User'}
                              />
                            </div>
                          )}

                          {/* Document List */}
                          <DocumentList 
                            documents={selectedContact.documents || []}
                            onView={(doc) => setViewingDocument(doc)}
                            onDelete={handleDeleteDocument}
                            onDownload={(doc) => {
                              // In a real app, this would handle the document download
                              toast.info(`Downloading ${doc.filename}`);
                            }}
                            contactId={selectedContact.id}
                          />

                          {/* Document Viewer Modal */}
                          <AnimatePresence>
                            {viewingDocument && (
                              <DocumentViewer 
                                document={viewingDocument}
                                onClose={() => setViewingDocument(null)}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold">Contact Details</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditContact}
                        className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                        aria-label="Edit contact"
                      >
                        <EditIcon className="w-5 h-5 text-primary" />
                      </button>
                      <button
                        onClick={handleDeleteContact}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete contact"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6 pb-6 border-b border-surface-200 dark:border-surface-700">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                        {selectedContact.name.split(' ').map(name => name[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{selectedContact.name}</h3>
                        <p className="text-surface-600 dark:text-surface-400">{selectedContact.position}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 flex-grow">
                    <div>
                      <h4 className="text-sm font-medium text-surface-500 mb-2">Contact Information</h4>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                          <BuildingIcon className="w-5 h-5 text-surface-400" />
                          <span>{selectedContact.company}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <BriefcaseIcon className="w-5 h-5 text-surface-400" />
                          <span>{selectedContact.position}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <MailIcon className="w-5 h-5 text-surface-400" />
                          <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                            {selectedContact.email}
                          </a>
                        </li>
                        <li className="flex items-center gap-3">
                          <PhoneIcon className="w-5 h-5 text-surface-400" />
                          <a href={`tel:${selectedContact.phone}`} className="text-primary hover:underline">
                            {selectedContact.phone}
                          </a>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-surface-500 mb-2">Status</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedContact.status)}
                        <span className="capitalize">{selectedContact.status}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-surface-500 mb-2">Last Contact</h4>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-surface-400" />
                        <span>{selectedContact.lastContact}</span>
                      </div>
                    </div>
                    
                    {selectedContact.tags && selectedContact.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-surface-500 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedContact.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Notes Section */}
                    <NotesSection 
                      contact={selectedContact} 
                      onAddNote={handleAddNote}
                      onUpdateContact={(updatedContact) => {
                        setSelectedContact(updatedContact);
                        setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
                      }}
                      currentUser={currentUser || 'Current User'}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center mb-4">
                    <UserPlusIcon className="w-10 h-10 text-surface-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Contact Selected</h3>
                  <p className="text-surface-500 max-w-xs mb-6">
                    Select a contact from the list to view details or add a new contact to get started.
                  </p>
                  <button
                    onClick={handleAddContact}
                    className="btn-primary flex items-center gap-2"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Add New Contact</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Contact Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-soft w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    {formMode === 'add' ? 'Add New Contact' : 'Edit Contact'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="new">New</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags && formData.tags.map(tag => (
                        <div 
                          key={tag} 
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-primary/70 hover:text-primary"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="input-field rounded-r-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-primary text-white px-3 rounded-r-lg hover:bg-primary-dark transition-colors"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {formMode === 'add' ? 'Add Contact' : 'Update Contact'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;