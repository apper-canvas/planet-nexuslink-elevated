/**
 * EmailService.js
 * Service for managing emails using ApperClient
 */

// Fields based on the table definition
const FIELDS = [
  'Name',
  'Tags',
  'Owner',
  'CreatedOn',
  'CreatedBy',
  'ModifiedOn',
  'ModifiedBy',
  'subject',
  'fromName',
  'fromEmail',
  'toRecipients',
  'ccRecipients',
  'bccRecipients',
  'body',
  'preview',
  'timestamp',
  'read',
  'folder'
];

class EmailService {
  constructor() {
    this.tableName = 'email';
    this.initialize();
  }

  initialize() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  /**
   * Get emails with optional filtering
   * @param {string} folder - Email folder (inbox, sent, drafts, trash, archive)
   * @param {Object} options - Query options
   * @returns {Promise} Promise resolving to emails data
   */
  async getEmails(folder = 'inbox', options = {}) {
    try {
      const params = {
        fields: FIELDS,
        pagingInfo: {
          limit: options.limit || 50,
          offset: options.offset || 0
        },
        orderBy: [
          {
            field: 'timestamp',
            direction: 'DESC'
          }
        ],
        where: [
          {
            fieldName: 'folder',
            operator: 'ExactMatch',
            values: [folder]
          }
        ]
      };

      // Add search filter if specified
      if (options.search) {
        params.where.push({
          fieldName: 'subject',
          operator: 'Contains',
          values: [options.search]
        });
        // Add search in email body too
        params.whereGroups = [
          {
            operator: 'OR',
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: 'subject',
                    operator: 'Contains',
                    values: [options.search]
                  }
                ]
              },
              {
                conditions: [
                  {
                    fieldName: 'body',
                    operator: 'Contains',
                    values: [options.search]
                  }
                ]
              }
            ]
          }
        ];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  /**
   * Get a single email by ID
   * @param {string} id - Email ID
   * @returns {Promise} Promise resolving to email data
   */
  async getEmailById(id) {
    try {
      const response = await this.apperClient.getRecordById(this.tableName, id);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching email with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get email thread based on subject
   * @param {string} emailId - Base email ID
   * @returns {Promise} Promise resolving to thread emails
   */
  async getEmailThread(emailId) {
    try {
      // First get the base email
      const email = await this.getEmailById(emailId);
      if (!email) return [];
      
      // Then find related emails with similar subject
      const subject = email.subject.replace(/^(Re:|Fwd:)\s*/i, '').trim();
      
      const params = {
        fields: FIELDS,
        where: [
          {
            fieldName: 'subject',
            operator: 'Contains',
            values: [subject]
          }
        ],
        orderBy: [
          {
            field: 'timestamp',
            direction: 'ASC'
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching email thread:', error);
      throw error;
    }
  }

  /**
   * Send a new email
   * @param {Object} emailData - Email data
   * @returns {Promise} Promise resolving to sent email
   */
  async sendEmail(emailData) {
    try {
      const preview = emailData.body ? emailData.body.substring(0, 100) + '...' : '';
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: emailData.subject || 'No Subject',
          Tags: emailData.tags || '',
          subject: emailData.subject || 'No Subject',
          fromName: emailData.fromName || 'Current User',
          fromEmail: emailData.fromEmail || 'user@example.com',
          toRecipients: Array.isArray(emailData.to) ? emailData.to.join(',') : emailData.to || '',
          ccRecipients: Array.isArray(emailData.cc) ? emailData.cc.join(',') : emailData.cc || '',
          bccRecipients: Array.isArray(emailData.bcc) ? emailData.bcc.join(',') : emailData.bcc || '',
          body: emailData.body || '',
          preview: preview,
          timestamp: new Date().toISOString(),
          read: true,
          folder: 'sent'
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Save email as draft
   * @param {Object} draftData - Draft email data
   * @returns {Promise} Promise resolving to saved draft
   */
  async saveDraft(draftData) {
    try {
      const preview = draftData.body ? draftData.body.substring(0, 100) + '...' : '(No content)';
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: draftData.subject || 'Draft',
          Tags: draftData.tags || '',
          subject: draftData.subject || 'Draft',
          fromName: draftData.fromName || 'Current User',
          fromEmail: draftData.fromEmail || 'user@example.com',
          toRecipients: Array.isArray(draftData.to) ? draftData.to.join(',') : draftData.to || '',
          ccRecipients: Array.isArray(draftData.cc) ? draftData.cc.join(',') : draftData.cc || '',
          bccRecipients: Array.isArray(draftData.bcc) ? draftData.bcc.join(',') : draftData.bcc || '',
          body: draftData.body || '',
          preview: preview,
          timestamp: new Date().toISOString(),
          read: true,
          folder: 'drafts'
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  /**
   * Mark an email as read
   * @param {string} emailId - Email ID
   * @returns {Promise} Promise resolving to success status
   */
  async markAsRead(emailId) {
    try {
      const params = {
        records: [{
          Id: emailId,
          read: true
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      return response.success;
    } catch (error) {
      console.error(`Error marking email ${emailId} as read:`, error);
      throw error;
    }
  }

  /**
   * Move an email to trash
   * @param {string} emailId - Email ID
   * @returns {Promise} Promise resolving to success status
   */
  async moveToTrash(emailId) {
    try {
      const params = {
        records: [{
          Id: emailId,
          folder: 'trash'
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      return response.success;
    } catch (error) {
      console.error(`Error moving email ${emailId} to trash:`, error);
      throw error;
    }
  }

  /**
   * Archive an email
   * @param {string} emailId - Email ID
   * @returns {Promise} Promise resolving to success status
   */
  async archiveEmail(emailId) {
    try {
      const params = {
        records: [{
          Id: emailId,
          folder: 'archive'
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      return response.success;
    } catch (error) {
      console.error(`Error archiving email ${emailId}:`, error);
      throw error;
    }
  }
}

export default new EmailService();