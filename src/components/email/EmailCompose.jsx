import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { validateEmail, getEmailTemplates } from '../../utils/emailUtils';
import EmailService from '../../services/EmailService';

const EmailCompose = ({ 
  onSend, 
  onCancel, 
  onSaveDraft, 
  replyTo, 
  forwardEmail, 
  currentUser 
}) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [contacts, setContacts] = useState([]);
  
  // Icons
  const SendIcon = getIcon('send');
  const XIcon = getIcon('x');
  const SaveIcon = getIcon('save');
  const PaperclipIcon = getIcon('paperclip');
  const ChevronDownIcon = getIcon('chevron-down');
  const ChevronUpIcon = getIcon('chevron-up');

  // Email templates
  const templates = getEmailTemplates();

  // Load contacts for autocomplete
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const contactList = await EmailService.getContacts();
        setContacts(contactList);
      } catch (error) {
        console.error('Error loading contacts:', error);
      }
    };

    loadContacts();
  }, []);

  // Pre-fill for reply or forward
  useEffect(() => {
    if (replyTo) {
      setTo(replyTo.from.email);
      setSubject(`Re: ${replyTo.subject}`);
      setBody(`\n\n-------- Original Message --------\nFrom: ${replyTo.from.name} <${replyTo.from.email}>\nDate: ${new Date(replyTo.timestamp).toLocaleString()}\nSubject: ${replyTo.subject}\n\n${replyTo.body}`);
    } else if (forwardEmail) {
      setSubject(`Fwd: ${forwardEmail.subject}`);
      setBody(`\n\n-------- Forwarded Message --------\nFrom: ${forwardEmail.from.name} <${forwardEmail.from.email}>\nDate: ${new Date(forwardEmail.timestamp).toLocaleString()}\nSubject: ${forwardEmail.subject}\n\n${forwardEmail.body}`);

      // Include original attachments
      if (forwardEmail.attachments && forwardEmail.attachments.length > 0) {
        setAttachments(forwardEmail.attachments);
      }
    }
  }, [replyTo, forwardEmail]);

  const handleTemplateChange = (e) => {
    const selected = e.target.value;
    setTemplateId(selected);

    if (selected) {
      const template = templates.find(t => t.id === selected);
      if (template) {
        setSubject(template.subject);
        setBody(template.body);
      }
    }
  };

  const handleSend = async () => {
    // Validate email addresses
    if (!to.trim()) {
      toast.error('Please enter at least one recipient');
      return;
    }

    const toEmails = to.split(',').map(email => email.trim());
    const ccEmails = cc ? cc.split(',').map(email => email.trim()) : [];
    const bccEmails = bcc ? bcc.split(',').map(email => email.trim()) : [];

    const allEmails = [...toEmails, ...ccEmails, ...bccEmails];
    const invalidEmails = allEmails.filter(email => !validateEmail(email));

    if (invalidEmails.length > 0) {
      toast.error(`Invalid email address${invalidEmails.length > 1 ? 'es' : ''}: ${invalidEmails.join(', ')}`);
      return;
    }

    if (!subject.trim()) {
      const confirmSend = window.confirm('Send email without a subject?');
      if (!confirmSend) return;
    }

    setIsSending(true);
    
    const emailData = {
      to: toEmails,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      bcc: bccEmails.length > 0 ? bccEmails : undefined,
      subject: subject.trim() || '(No subject)',
      body,
      attachments
    };

    try {
      await onSend(emailData);
    } catch (error) {
      toast.error('Failed to send email');
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      to: to.split(',').map(email => email.trim()),
      cc: cc ? cc.split(',').map(email => email.trim()) : [],
      bcc: bcc ? bcc.split(',').map(email => email.trim()) : [],
      subject,
      body,
      attachments
    };

    onSaveDraft(draftData);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {replyTo ? 'Reply to Email' : forwardEmail ? 'Forward Email' : 'New Email'}
        </h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="p-2 rounded hover:bg-surface-100 dark:hover:bg-surface-700">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <div className="space-y-4">
          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="to" className="block text-sm font-medium mb-1">To:</label>
              <button 
                onClick={() => setShowCcBcc(!showCcBcc)}
                className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
              >
                {showCcBcc ? 'Hide' : 'Show'} Cc/Bcc
                {showCcBcc ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
              </button>
            </div>
            <input
              id="to"
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com, another@example.com"
              className="input-field"
              required
            />
          </div>

          {/* Cc and Bcc fields (conditionally shown) */}
          {showCcBcc && (
            <>
              <div>
                <label htmlFor="cc" className="block text-sm font-medium mb-1">Cc:</label>
                <input
                  id="cc"
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="bcc" className="block text-sm font-medium mb-1">Bcc:</label>
                <input
                  id="bcc"
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                  className="input-field"
                />
              </div>
            </>
          )}

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject:</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="input-field"
            />
          </div>

          {/* Template selector */}
          {!replyTo && !forwardEmail && (
            <div>
              <label htmlFor="template" className="block text-sm font-medium mb-1">Use Template:</label>
              <select
                id="template"
                value={templateId}
                onChange={handleTemplateChange}
                className="input-field"
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Email body */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium mb-1">Message:</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="input-field min-h-[200px]"
              rows={10}
            ></textarea>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-2">Attachments:</label>
            <div className="space-y-2">
              {attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-surface-50 dark:bg-surface-700 rounded border border-surface-200 dark:border-surface-600">
                  <div className="flex items-center gap-2">
                    <PaperclipIcon className="w-4 h-4 text-surface-500" />
                    <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                    <span className="text-xs text-surface-500">
                      {(attachment.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div>
                <label className="btn-secondary inline-flex items-center gap-1 text-sm cursor-pointer">
                  <PaperclipIcon className="w-4 h-4" />
                  <span>Attach Files</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-surface-200 dark:border-surface-700 flex justify-between">
        <button
          onClick={handleSaveDraft}
          className="btn-secondary flex items-center gap-1"
        >
          <SaveIcon className="w-4 h-4" />
          <span>Save Draft</span>
        </button>
        <button
          onClick={handleSend}
          disabled={isSending}
          className="btn-primary flex items-center gap-1"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <SendIcon className="w-4 h-4" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailCompose;