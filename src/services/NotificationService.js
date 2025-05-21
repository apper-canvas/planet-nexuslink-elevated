/**
 * NotificationService.js
 * Service for managing notifications using ApperClient
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
  'from',
  'contactName',
  'contactId',
  'read',
  'timestamp'
];

class NotificationService {
  constructor() {
    this.tableName = 'Notification1';
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
   * Get all notifications with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise} Promise resolving to notifications data
   */
  async getNotifications(options = {}) {
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
        ]
      };

      // Add filter for read status if specified
      if (options.readStatus !== undefined) {
        params.where = [
          {
            fieldName: 'read',
            operator: 'ExactMatch',
            values: [options.readStatus]
          }
        ];
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @returns {Promise} Promise resolving to success status
   */
  async markAsRead(id) {
    try {
      const params = {
        records: [{
          Id: id,
          read: true
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      return response.success;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  }

  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise} Promise resolving to created notification
   */
  async createNotification(notificationData) {
    try {
      const params = {
        records: [{
          Name: `Notification from ${notificationData.from}`,
          from: notificationData.from,
          contactName: notificationData.contactName,
          contactId: notificationData.contactId,
          read: false,
          timestamp: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      return response.success ? response.results[0].data : null;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications (delete all)
   * Simplified implementation: marks all as read instead of deleting
   * @returns {Promise} Promise resolving to success status
   */
  async clearAllNotifications() {
    try {
      // In real implementation, you might want to implement batch update
      // or create a specific endpoint for this operation
      const notifications = await this.getNotifications();
      
      // Simple implementation for now - just mark all as read
      const updatePromises = notifications
        .filter(notification => !notification.read)
        .map(notification => this.markAsRead(notification.id));
      
      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService();