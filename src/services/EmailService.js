import { formatEmails } from '../utils/emailUtils';

class EmailService {
  constructor() {
    this.storageKey = 'nexuslink-emails';
    this.contactsKey = 'crm-contacts';
    this.draftsKey = 'nexuslink-email-drafts';
    this.init();
  }

  init() {
    // Initialize with sample data if no emails exist
    if (!localStorage.getItem(this.storageKey)) {
      const sampleEmails = this.generateSampleEmails();
      localStorage.setItem(this.storageKey, JSON.stringify(sampleEmails));
    }

    // Initialize drafts if they don't exist
    if (!localStorage.getItem(this.draftsKey)) {
      localStorage.setItem(this.draftsKey, JSON.stringify([]));
    }
  }

  generateSampleEmails() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return [
      {
        id: 'email-1',
        subject: 'Quarterly Business Review',
        from: {
          name: 'Sarah Johnson',
          email: 'sarah.j@innovatech.com'
        },
        to: [
          {
            name: 'Current User',
            email: 'user@nexuslink.com'
          }
        ],
        cc: [],
        bcc: [],
        body: "Hi there,\n\nI wanted to schedule our quarterly business review for next month. We've seen some great results with the implementation of your software, and I'd like to discuss expanding our usage.\n\nDo you have availability next Wednesday afternoon?\n\nBest regards,\nSarah",
        preview: "I wanted to schedule our quarterly business review for next month...",
        timestamp: now.toISOString(),
        read: false,
        folder: 'inbox',
        attachments: []
      },
      {
        id: 'email-2',
        subject: 'Project Update: New Website Launch',
        from: {
          name: 'David Chen',
          email: 'd.chen@grpartners.com'
        },
        to: [
          {
            name: 'Current User',
            email: 'user@nexuslink.com'
          }
        ],
        cc: [
          {
            name: 'Maria Rodriguez',
            email: 'mrodriguez@sunshine-hosp.com'
          }
        ],
        body: "Hello,\n\nI'm reaching out regarding the upcoming website launch. We're on track for our target date, but I wanted to discuss a few design changes before we go live.\n\nCould you review the attached mockups and provide feedback by Friday?\n\nThanks,\nDavid",
        preview: "I'm reaching out regarding the upcoming website launch...",
        timestamp: yesterday.toISOString(),
        read: true,
        folder: 'inbox',
        attachments: [
          {
            id: 'att-1',
            name: 'Website_Mockups_v2.pdf',
            size: 4500000,
            type: 'application/pdf'
          }
        ]
      },
      {
        id: 'email-3',
        subject: 'Service Contract Renewal',
        from: {
          name: 'Current User',
          email: 'user@nexuslink.com'
        },
        to: [
          {
            name: 'Miguel Rodriguez',
            email: 'mrodriguez@sunshine-hosp.com'
          }
        ],
        cc: [],
        bcc: [],
        body: "Hi Miguel,\n\nI wanted to touch base about your service contract renewal. Your current agreement expires next month, and we've prepared a new proposal with some enhanced features based on your usage patterns.\n\nWould you like to schedule a call to discuss the details?\n\nBest regards,\nNexusLink Team",
        preview: "I wanted to touch base about your service contract renewal...",
        timestamp: lastWeek.toISOString(),
        read: true,
        folder: 'sent',
        attachments: [
          {
            id: 'att-2',
            name: 'Sunshine_Renewal_Proposal.docx',
            size: 1200000,
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }
        ]
      }
    ];
  }

  async getEmails(folder = 'inbox') {
    // Simulate network delay
    await this.delay(500);
    
    const emails = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    
    if (folder === 'drafts') {
      return JSON.parse(localStorage.getItem(this.draftsKey) || '[]')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    return emails
      .filter(email => email.folder === folder)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getEmailById(id) {
    await this.delay(300);
    
    const emails = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const drafts = JSON.parse(localStorage.getItem(this.draftsKey) || '[]');
    
    return emails.find(email => email.id === id) || 
           drafts.find(draft => draft.id === id) ||
           null;
  }

  async getEmailThread(emailId) {
    await this.delay(500);
    
    const email = await this.getEmailById(emailId);
    if (!email) return [];
    
    const emails = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    
    // For simplicity, we're just returning emails with the same subject
    // In a real app, this would use proper threading with references/in-reply-to headers
    return emails
      .filter(e => 
        e.subject.replace(/^(Re:|Fwd:)\s*/i, '').trim() === 
        email.subject.replace(/^(Re:|Fwd:)\s*/i, '').trim()
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  async sendEmail(emailData) {
    await this.delay(1000);
    
    const emails = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const now = new Date();
    
    // Format recipients
    const formattedRecipients = emailData.to.map(email => {
      const contact = this.findContactByEmail(email);
      return contact ? 
        { name: contact.name, email: contact.email } : 
        { name: email.split('@')[0], email };
    });
    
    const newEmail = {
      id: `email-${Date.now()}`,
      subject: emailData.subject,
      from: {
        name: 'Current User',
        email: 'user@nexuslink.com'
      },
      to: formattedRecipients,
      cc: emailData.cc ? emailData.cc.map(email => {
        const contact = this.findContactByEmail(email);
        return contact ? 
          { name: contact.name, email: contact.email } : 
          { name: email.split('@')[0], email };
      }) : [],
      bcc: emailData.bcc ? emailData.bcc.map(email => {
        const contact = this.findContactByEmail(email);
        return contact ? 
          { name: contact.name, email: contact.email } : 
          { name: email.split('@')[0], email };
      }) : [],
      body: emailData.body,
      preview: emailData.body.substring(0, 100) + '...',
      timestamp: now.toISOString(),
      read: true,
      folder: 'sent',
      attachments: emailData.attachments || []
    };
    
    emails.push(newEmail);
    localStorage.setItem(this.storageKey, JSON.stringify(emails));
    
    return newEmail;
  }

  async saveDraft(draftData) {
    await this.delay(500);
    
    const drafts = JSON.parse(localStorage.getItem(this.draftsKey) || '[]');
    const now = new Date();
    
    const newDraft = {
      id: `draft-${Date.now()}`,
      ...draftData,
      preview: draftData.body ? draftData.body.substring(0, 100) + '...' : '(No content)',
      timestamp: now.toISOString(),
      folder: 'drafts'
    };
    
    drafts.push(newDraft);
    localStorage.setItem(this.draftsKey, JSON.stringify(drafts));
    
    return newDraft;
  }

  async markAsRead(emailId) {
    await this.delay(300);
    
    const emails = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const updatedEmails = emails.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    );
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedEmails));
  }

  async moveToTrash(emailId) {
    await this.delay(500);
    
    const emails = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const updatedEmails = emails.map(email => 
      email.id === emailId ? { ...email, folder: 'trash' } : email
    );
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedEmails));
  }

  async deleteEmailPermanently(emailId) {
    await this.delay(800);
    
    const emails = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const updatedEmails = emails.filter(email => email.id !== emailId);
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedEmails));
  }

  async archiveEmail(emailId) {
    await this.delay(500);
    
    const emails = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const updatedEmails = emails.map(email => 
      email.id === emailId ? { ...email, folder: 'archive' } : email
    );
    
    localStorage.setItem(this.storageKey, JSON.stringify(updatedEmails));
  }

  async getContacts() {
    await this.delay(300);
    
    const contacts = JSON.parse(localStorage.getItem(this.contactsKey) || '[]');
    
    return contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      company: contact.company
    }));
  }

  findContactByEmail(email) {
    const contacts = JSON.parse(localStorage.getItem(this.contactsKey) || '[]');
    return contacts.find(contact => contact.email === email);
  }

  async downloadAttachment(attachmentId) {
    await this.delay(1000);
    // In a real app, this would download the actual file
    return { success: true };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new EmailService();