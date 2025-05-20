import { useState } from 'react';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { updateSettings } from '../../services/SettingsService';

const IntegrationsSettings = ({ settings, setSettings }) => {
  const [integrations, setIntegrations] = useState({ ...settings.integrations });
  const [isSaving, setIsSaving] = useState(false);

  // Icons
  const PlugIcon = getIcon('plug');
  const GoogleIcon = getIcon('mail');
  const OutlookIcon = getIcon('mail');
  const SlackIcon = getIcon('message-square');
  const ZoomIcon = getIcon('video');
  const StripeIcon = getIcon('credit-card');
  const LinkIcon = getIcon('link');
  const UnlinkIcon = getIcon('unlink');
  const CheckIcon = getIcon('check');

  const handleConnect = (service) => {
    // Simulate connection process
    toast.info(`Connecting to ${service}...`);
    
    setTimeout(() => {
      let updatedIntegrations = { ...integrations };
      
      if (service === 'google') {
        updatedIntegrations.google = {
          connected: true,
          email: 'user@gmail.com'
        };
      } else if (service === 'outlook') {
        updatedIntegrations.outlook = {
          connected: true,
          email: 'user@outlook.com'
        };
      } else if (service === 'slack') {
        updatedIntegrations.slack = {
          connected: true,
          workspace: 'Your Workspace'
        };
      } else if (service === 'zoom') {
        updatedIntegrations.zoom = {
          connected: true
        };
      } else if (service === 'stripe') {
        updatedIntegrations.stripe = {
          connected: true
        };
      }
      
      setIntegrations(updatedIntegrations);
      toast.success(`Connected to ${service} successfully!`);
    }, 1500);
  };

  const handleDisconnect = (service) => {
    let updatedIntegrations = { ...integrations };
    
    if (service === 'google') {
      updatedIntegrations.google = {
        connected: false,
        email: ''
      };
    } else if (service === 'outlook') {
      updatedIntegrations.outlook = {
        connected: false,
        email: ''
      };
    } else if (service === 'slack') {
      updatedIntegrations.slack = {
        connected: false,
        workspace: ''
      };
    } else if (service === 'zoom') {
      updatedIntegrations.zoom = {
        connected: false
      };
    } else if (service === 'stripe') {
      updatedIntegrations.stripe = {
        connected: false
      };
    }
    
    setIntegrations(updatedIntegrations);
    toast.success(`Disconnected from ${service}`);
  };

  const saveIntegrations = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = updateSettings('integrations', integrations);
      setSettings(updatedSettings);
      toast.success('Integration settings saved successfully');
    } catch (error) {
      toast.error('Failed to save integration settings');
      console.error('Error saving integration settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const IntegrationCard = ({ title, description, icon: Icon, service, status, account }) => (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-start">
        <div className="w-10 h-10 flex-shrink-0 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mr-3">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-grow">
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">{description}</p>
          {status && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckIcon className="w-3 h-3 mr-1" /> Connected
              </span>
              {account && (
                <span className="ml-2 text-xs text-surface-500">
                  {account}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3 bg-surface-50 dark:bg-surface-800 flex justify-end">
        {status ? (
          <button 
            onClick={() => handleDisconnect(service)}
            className="btn-secondary text-sm flex items-center"
          >
            <UnlinkIcon className="w-4 h-4 mr-1" /> Disconnect
          </button>
        ) : (
          <button 
            onClick={() => handleConnect(service)}
            className="btn-primary text-sm flex items-center"
          >
            <LinkIcon className="w-4 h-4 mr-1" /> Connect
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <PlugIcon className="w-5 h-5" /> Third-Party Integrations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <IntegrationCard
            title="Google Workspace"
            description="Connect your Gmail account to import contacts, send emails, and sync calendar events."
            icon={GoogleIcon}
            service="google"
            status={integrations.google.connected}
            account={integrations.google.email}
          />
          
          <IntegrationCard
            title="Microsoft 365"
            description="Connect Outlook and other Microsoft services to sync emails, contacts, and calendar."
            icon={OutlookIcon}
            service="outlook"
            status={integrations.outlook.connected}
            account={integrations.outlook.email}
          />
          
          <IntegrationCard
            title="Slack"
            description="Get notifications in Slack and share CRM data with your team."
            icon={SlackIcon}
            service="slack"
            status={integrations.slack.connected}
            account={integrations.slack.workspace ? `Workspace: ${integrations.slack.workspace}` : null}
          />
          
          <IntegrationCard
            title="Zoom"
            description="Schedule and start Zoom meetings directly from contact and deal records."
            icon={ZoomIcon}
            service="zoom"
            status={integrations.zoom.connected}
          />
        </div>
      </div>
      
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <StripeIcon className="w-5 h-5" /> Payment Integrations
        </h2>
        
        <IntegrationCard
          title="Stripe"
          description="Process payments, track invoices, and manage subscriptions with Stripe integration."
          icon={StripeIcon}
          service="stripe"
          status={integrations.stripe.connected}
        />
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={saveIntegrations}
          className="btn-primary"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Integration Settings'}
        </button>
      </div>
    </div>
  );
};

export default IntegrationsSettings;