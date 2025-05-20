/**
 * Email utility functions for the NexusLink CRM
 */

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - Whether the email is valid
 */
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Formats a list of email objects for display
 * @param {Array} emails - Array of email objects
 * @returns {Array} - Formatted email objects
 */
export const formatEmails = (emails) => {
  if (!emails || !Array.isArray(emails)) return [];
  
  return emails.map(email => {
    // Extract preview text from the email body
    const preview = email.body 
      ? email.body.substring(0, 100) + (email.body.length > 100 ? '...' : '')
      : '';
      
    return {
      ...email,
      preview
    };
  });
};

/**
 * Returns a human-readable file size string
 * @param {number} bytes - The file size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets a list of email templates
 * @returns {Array} - Email templates
 */
export const getEmailTemplates = () => {
  return [
    {
      id: 'template-1',
      name: 'Initial Contact',
      subject: 'Introduction and Services Overview',
      body: `Dear [Contact Name],

I hope this email finds you well. My name is [Your Name] from NexusLink, and I wanted to reach out to introduce our services that I believe could benefit [Company Name].

Our platform specializes in [key benefit], which has helped similar organizations in your industry achieve [specific result].

Would you be interested in a brief call to discuss how we might be able to support your business goals?

Best regards,
[Your Name]
NexusLink Team`
    },
    {
      id: 'template-2',
      name: 'Follow-up After Meeting',
      subject: 'Thank You and Next Steps',
      body: `Hi [Contact Name],

Thank you for taking the time to meet with me yesterday. I appreciated learning more about your current challenges with [specific challenge discussed].

As promised, I've attached additional information about our [product/service] that addresses the points we discussed. Here's a summary of the next steps we agreed on:

1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

Please let me know if you have any questions or if there's anything else you need from me.

Looking forward to our next conversation.

Best regards,
[Your Name]`
    }
  ];
};