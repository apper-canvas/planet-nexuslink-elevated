import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import EmailService from '../../services/EmailService';

const EmailDetail = ({ 
  email, 
  onReply, 
  onForward, 
  onDelete, 
  onBack, 
  currentUser 
}) => {
  const [thread, setThread] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  // Icons
  const ReplyIcon = getIcon('reply');
  const ForwardIcon = getIcon('arrow-right');
  const TrashIcon = getIcon('trash');
  const ArrowLeftIcon = getIcon('arrow-left');
  const UserIcon = getIcon('user');
  const ChevronDownIcon = getIcon('chevron-down');
  const ChevronUpIcon = getIcon('chevron-up');
  const PaperclipIcon = getIcon('paperclip');
  const DownloadIcon = getIcon('download');
  const ArchiveIcon = getIcon('archive');
  const PrinterIcon = getIcon('printer');
  
  // Load email thread
  useEffect(() => {
    const loadThread = async () => {
      setIsLoading(true);
      try {
        const threadEmails = await EmailService.getEmailThread(email.id);
        setThread(threadEmails);
      } catch (error) {
        console.error('Error loading email thread:', error);
        // If we can't get the thread, just show the current email
        setThread([email]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThread();
  }, [email]);
  
  const handleArchive = async () => {
    try {
      await EmailService.archiveEmail(email.id);
      toast.success('Email archived');
      onBack();
    } catch (error) {
      toast.error('Failed to archive email');
      console.error('Error archiving email:', error);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadAttachment = (attachment) => {
    EmailService.downloadAttachment(attachment.id)
      .then(() => {
        toast.success(`Downloaded ${attachment.name}`);
      })
      .catch(error => {
        toast.error('Failed to download attachment');
        console.error('Error downloading attachment:', error);
      });
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
            title="Back to list"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold truncate">{email.subject}</h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleArchive}
            className="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
            title="Archive"
          >
            <ArchiveIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
            title="Print"
          >
            <PrinterIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
            title="Delete"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">{email.from.name}</div>
                  <div className="text-sm text-surface-500">{email.from.email}</div>
                </div>
              </div>
              <div className="text-sm text-surface-500">
                {format(new Date(email.timestamp), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
            
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 mb-2"
              >
                {showDetails ? 'Hide' : 'Show'} Details
                {showDetails ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
              </button>
              
              {showDetails && (
                <div className="bg-surface-50 dark:bg-surface-800 p-3 rounded text-sm mb-4">
                  <div className="mb-1"><strong>From:</strong> {email.from.name} &lt;{email.from.email}&gt;</div>
                  <div className="mb-1"><strong>To:</strong> {email.to.map(r => `${r.name} <${r.email}>`).join('; ')}</div>
                  {email.cc && email.cc.length > 0 && (
                    <div className="mb-1"><strong>Cc:</strong> {email.cc.map(r => `${r.name} <${r.email}>`).join('; ')}</div>
                  )}
                  <div><strong>Date:</strong> {new Date(email.timestamp).toLocaleString()}</div>
                </div>
              )}
            </div>
            
            <div className="whitespace-pre-wrap">{email.body}</div>
            
            {email.attachments && email.attachments.length > 0 && (
              <div className="border-t border-surface-200 dark:border-surface-700 pt-4 mt-4">
                <h3 className="font-medium mb-2">Attachments ({email.attachments.length})</h3>
                <div className="space-y-2">
                  {email.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-surface-50 dark:bg-surface-700 rounded border border-surface-200 dark:border-surface-600">
                      <div className="flex items-center gap-2">
                        <PaperclipIcon className="w-4 h-4 text-surface-500" />
                        <span className="text-sm">{attachment.name}</span>
                        <span className="text-xs text-surface-500">
                          {(attachment.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadAttachment(attachment)}
                        className="text-primary hover:text-primary-dark"
                        title="Download"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-surface-200 dark:border-surface-700 flex gap-2">
        <button
          onClick={onReply}
          className="btn-primary flex items-center gap-1"
        >
          <ReplyIcon className="w-4 h-4" />
          <span>Reply</span>
        </button>
        <button
          onClick={onForward}
          className="btn-secondary flex items-center gap-1"
        >
          <ForwardIcon className="w-4 h-4" />
          <span>Forward</span>
        </button>
      </div>
    </div>
  );
};

export default EmailDetail;