import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import EmailList from './EmailList';
import EmailCompose from './EmailCompose';
import EmailDetail from './EmailDetail';
import EmailService from '../../services/EmailService';
import { formatEmails } from '../../utils/emailUtils';

const EmailModule = ({ darkMode, currentUser }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingEmail, setForwardingEmail] = useState(null);
  
  // Icons
  const InboxIcon = getIcon('inbox');
  const SendIcon = getIcon('send');
  const FileIcon = getIcon('file');
  const TrashIcon = getIcon('trash');
  const EditIcon = getIcon('edit');
  const SearchIcon = getIcon('search');
  const MailIcon = getIcon('mail');
  const RefreshIcon = getIcon('refresh-cw');
  const PlusIcon = getIcon('plus');
  
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: InboxIcon },
    { id: 'sent', name: 'Sent', icon: SendIcon },
    { id: 'drafts', name: 'Drafts', icon: FileIcon },
    { id: 'trash', name: 'Trash', icon: TrashIcon }
  ];
  
  // Load emails on component mount
  useEffect(() => {
    const loadEmails = async () => {
      setIsLoading(true);
      try {
        const emailData = await EmailService.getEmails(activeFolder);
        setEmails(emailData);
      } catch (error) {
        toast.error('Failed to load emails');
        console.error('Error loading emails:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEmails();
  }, [activeFolder]);
  
  // Filter emails when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmails(emails);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = emails.filter(email => 
      email.subject.toLowerCase().includes(term) || 
      email.from.name.toLowerCase().includes(term) || 
      email.to.some(recipient => recipient.name.toLowerCase().includes(term)) ||
      email.body.toLowerCase().includes(term)
    );
    
    setFilteredEmails(filtered);
  }, [emails, searchTerm]);
  
  const handleFolderChange = (folder) => {
    setActiveFolder(folder);
    setSelectedEmail(null);
    setIsComposing(false);
  };
  
  const handleComposeNew = () => {
    setSelectedEmail(null);
    setIsComposing(true);
    setReplyingTo(null);
    setForwardingEmail(null);
  };
  
  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setIsComposing(false);
    
    // Mark email as read if it's not already
    if (!email.read) {
      const updatedEmail = { ...email, read: true };
      EmailService.markAsRead(email.id)
        .then(() => {
          setEmails(prev => 
            prev.map(e => e.id === email.id ? updatedEmail : e)
          );
        })
        .catch(error => {
          toast.error('Failed to mark email as read');
          console.error('Error marking email as read:', error);
        });
    }
  };
  
  const handleReplyToEmail = (email) => {
    setReplyingTo(email);
    setForwardingEmail(null);
    setIsComposing(true);
  };
  
  const handleForwardEmail = (email) => {
    setForwardingEmail(email);
    setReplyingTo(null);
    setIsComposing(true);
  };
  
  const handleSendEmail = async (emailData) => {
    setIsLoading(true);
    try {
      if (replyingTo) {
        // Handle reply
        await EmailService.sendEmail({
          ...emailData,
          inReplyTo: replyingTo.id,
          subject: replyingTo.subject.startsWith('Re:') 
            ? replyingTo.subject 
            : `Re: ${replyingTo.subject}`
        });
        toast.success('Reply sent successfully');
      } else if (forwardingEmail) {
        // Handle forward
        await EmailService.sendEmail({
          ...emailData,
          forwardedFrom: forwardingEmail.id,
          subject: forwardingEmail.subject.startsWith('Fwd:') 
            ? forwardingEmail.subject 
            : `Fwd: ${forwardingEmail.subject}`
        });
        toast.success('Email forwarded successfully');
      } else {
        // Handle new email
        await EmailService.sendEmail(emailData);
        toast.success('Email sent successfully');
      }
      
      // Reset state
      setIsComposing(false);
      setReplyingTo(null);
      setForwardingEmail(null);
      
      // If we're in sent folder, refresh the list
      if (activeFolder === 'sent') {
        const sentEmails = await EmailService.getEmails('sent');
        setEmails(sentEmails);
      }
    } catch (error) {
      toast.error('Failed to send email');
      console.error('Error sending email:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveDraft = async (draftData) => {
    try {
      await EmailService.saveDraft(draftData);
      toast.success('Draft saved');
      setIsComposing(false);
      
      // If we're in drafts folder, refresh the list
      if (activeFolder === 'drafts') {
        const drafts = await EmailService.getEmails('drafts');
        setEmails(drafts);
      }
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Error saving draft:', error);
    }
  };
  
  const handleDeleteEmail = async (emailId) => {
    try {
      if (activeFolder === 'trash') {
        await EmailService.deleteEmailPermanently(emailId);
        toast.success('Email permanently deleted');
      } else {
        await EmailService.moveToTrash(emailId);
        toast.success('Email moved to trash');
      }
      
      // Update emails list
      setEmails(prev => prev.filter(email => email.id !== emailId));
      
      // If the selected email was deleted, clear selection
      if (selectedEmail && selectedEmail.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      toast.error('Failed to delete email');
      console.error('Error deleting email:', error);
    }
  };
  
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const refreshedEmails = await EmailService.getEmails(activeFolder);
      setEmails(refreshedEmails);
      toast.success('Emails refreshed');
    } catch (error) {
      toast.error('Failed to refresh emails');
      console.error('Error refreshing emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row h-full gap-4">
        {/* Email Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="card h-full p-4">
            <button 
              onClick={handleComposeNew}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-6"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Compose</span>
            </button>
            
            <nav>
              <ul className="space-y-1">
                {folders.map(folder => (
                  <li key={folder.id}>
                    <button
                      onClick={() => handleFolderChange(folder.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeFolder === folder.id
                          ? 'bg-primary/10 text-primary dark:bg-primary/20'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300'
                      }`}
                    >
                      <folder.icon className="w-5 h-5" />
                      <span>{folder.name}</span>
                      {folder.id === 'inbox' && emails.filter(e => !e.read && e.folder === 'inbox').length > 0 && (
                        <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">
                          {emails.filter(e => !e.read && e.folder === 'inbox').length}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Main Email Content Area */}
        <div className="flex-1 flex flex-col">
          {isComposing ? (
            <EmailCompose 
              onSend={handleSendEmail}
              onCancel={() => setIsComposing(false)}
              onSaveDraft={handleSaveDraft}
              replyTo={replyingTo}
              forwardEmail={forwardingEmail}
              currentUser={currentUser}
            />
          ) : selectedEmail ? (
            <EmailDetail 
              email={selectedEmail}
              onReply={() => handleReplyToEmail(selectedEmail)}
              onForward={() => handleForwardEmail(selectedEmail)}
              onDelete={() => handleDeleteEmail(selectedEmail.id)}
              onBack={() => setSelectedEmail(null)}
              currentUser={currentUser}
            />
          ) : (
            <EmailList 
              emails={filteredEmails}
              isLoading={isLoading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSelectEmail={handleSelectEmail}
              onDeleteEmail={handleDeleteEmail}
              onRefresh={handleRefresh}
              activeFolder={activeFolder}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailModule;