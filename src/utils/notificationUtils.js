/**
 * Creates a notification and triggers an event
 * @param {Object} params - Notification parameters
 * @param {string} params.to - User ID of recipient
 * @param {string} params.from - User ID of sender
 * @param {string} params.contactId - ID of the contact
 * @param {string} params.contactName - Name of the contact
 * @param {string} params.noteText - Text of the note
 */
export const createNotification = ({ to, from, contactId, contactName, noteText }) => {
  // Only create a notification if the recipient is different from the sender
  if (to === from) return;
  
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    to,
    from,
    contactId,
    contactName,
    noteText: truncateText(noteText, 100),
    timestamp: new Date().toISOString(),
    read: false
  };
  
  // Dispatch a custom event that will be caught by the App component
  const event = new CustomEvent('new-notification', { detail: notification });
  window.dispatchEvent(event);
};

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength) => {
  // Remove any mention formatting
  const cleanText = text.replace(/@\[(.*?)\]\((.*?)\)/g, '@$1');
  
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + '...';
};