import { useState } from 'react';
import { toast } from 'react-toastify';
import { getIcon } from '../../utils/iconUtils';
import { updateSettings } from '../../services/SettingsService';

const SubscriptionSettings = ({ settings, setSettings }) => {
  const [subscription, setSubscription] = useState({ ...settings.subscription });
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(subscription.plan);
  const [billingCycle, setBillingCycle] = useState(subscription.billingCycle);
  
  // Icons
  const CreditCardIcon = getIcon('credit-card');
  const CheckIcon = getIcon('check');
  const AlertIcon = getIcon('alert-circle');
  const FileTextIcon = getIcon('file-text');
  const RefreshIcon = getIcon('refresh-cw');
  const ArrowRightIcon = getIcon('arrow-right');

  const plans = [
    {
      name: 'Basic',
      price: { monthly: 19.99, annual: 199.99 },
      features: [
        'Up to 1,000 contacts',
        'Email integration',
        'Basic reporting',
        'Deal management',
        '5GB document storage'
      ]
    },
    {
      name: 'Professional',
      price: { monthly: 49.99, annual: 499.99 },
      features: [
        'Up to 10,000 contacts',
        'Email & calendar integration',
        'Advanced reporting',
        'Pipeline customization',
        '25GB document storage',
        'API access'
      ]
    },
    {
      name: 'Enterprise',
      price: { monthly: 99.99, annual: 999.99 },
      features: [
        'Unlimited contacts',
        'Full integration suite',
        'Custom reporting',
        'Advanced workflow automation',
        '100GB document storage',
        'Dedicated support',
        'Custom branding'
      ]
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleUpdateSubscription = () => {
    setIsChangingPlan(false);
    
    // Find the selected plan pricing
    const plan = plans.find(p => p.name === selectedPlan);
    if (!plan) return;
    
    const updatedSubscription = {
      ...subscription,
      plan: selectedPlan,
      billingCycle: billingCycle,
      price: plan.price[billingCycle]
    };
    
    setSubscription(updatedSubscription);
    
    // Save to settings
    const updatedSettings = updateSettings('subscription', updatedSubscription);
    setSettings(updatedSettings);
    
    toast.success(`Subscription updated to ${selectedPlan} plan (${billingCycle} billing)`);
  };

  return (
    <div className="space-y-8">
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <CreditCardIcon className="w-5 h-5" /> Current Subscription
        </h2>
        
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center">
              <CreditCardIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold">{subscription.plan} Plan</div>
              <div className="flex items-center">
                <span className="text-xl font-medium">${subscription.price}</span>
                <span className="text-surface-500 dark:text-surface-400 ml-1">/{subscription.billingCycle}</span>
                <div className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  {subscription.status}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border border-surface-200 dark:border-surface-700 rounded-lg p-3">
              <div className="text-surface-500 dark:text-surface-400 mb-1">Next billing date</div>
              <div className="font-medium">{formatDate(subscription.nextBillingDate)}</div>
            </div>
            
            <div className="border border-surface-200 dark:border-surface-700 rounded-lg p-3">
              <div className="text-surface-500 dark:text-surface-400 mb-1">Payment method</div>
              <div className="font-medium">•••• •••• •••• 4242</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => setIsChangingPlan(!isChangingPlan)} 
            className="btn-primary w-full md:w-auto"
          >
            Change Plan
          </button>
          <button className="btn-secondary w-full md:w-auto md:ml-2">Update Payment Method</button>
          <button className="btn-secondary w-full md:w-auto md:ml-2">View Billing History</button>
        </div>
      </div>
      
      {isChangingPlan && (
        <div className="settings-card">
          <h2 className="settings-section-title flex items-center gap-2">
            <RefreshIcon className="w-5 h-5" /> Change Subscription Plan
          </h2>
          
          <div className="mb-4">
            <div className="flex gap-4 mb-6">
              <button 
                className={`flex-1 py-2 px-4 rounded-lg border ${billingCycle === 'monthly' ? 'border-primary bg-primary/10 text-primary' : 'border-surface-200 dark:border-surface-700'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button 
                className={`flex-1 py-2 px-4 rounded-lg border ${billingCycle === 'annual' ? 'border-primary bg-primary/10 text-primary' : 'border-surface-200 dark:border-surface-700'}`}
                onClick={() => setBillingCycle('annual')}
              >
                Annual (Save 20%)
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div 
                  key={plan.name}
                  className={`border rounded-xl overflow-hidden ${
                    selectedPlan === plan.name 
                      ? 'border-primary' 
                      : 'border-surface-200 dark:border-surface-700'
                  }`}
                >
                  <div className={`p-4 ${
                    selectedPlan === plan.name 
                      ? 'bg-primary/10 dark:bg-primary/20' 
                      : 'bg-white dark:bg-surface-800'
                  }`}>
                    <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold">${plan.price[billingCycle]}</span>
                      <span className="text-surface-500 dark:text-surface-400 ml-1">/{billingCycle}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      className={`w-full py-2 mt-4 rounded-lg ${
                        selectedPlan === plan.name 
                          ? 'bg-primary text-white' 
                          : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300'
                      }`}
                      onClick={() => setSelectedPlan(plan.name)}
                    >
                      {selectedPlan === plan.name ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 rounded-lg mb-4">
            <div className="flex items-start">
              <AlertIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-amber-700 dark:text-amber-400">
                Your subscription will be updated immediately. You will be charged or credited the prorated amount.
              </span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              className="btn-secondary mr-2"
              onClick={() => setIsChangingPlan(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-primary flex items-center"
              onClick={handleUpdateSubscription}
            >
              Confirm Change <ArrowRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
      
      <div className="settings-card">
        <h2 className="settings-section-title flex items-center gap-2">
          <FileTextIcon className="w-5 h-5" /> Billing History
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nov 1, 2023</td>
                <td>Professional Plan - Monthly</td>
                <td>$49.99</td>
                <td>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                    Paid
                  </span>
                </td>
                <td>
                  <button className="text-primary hover:underline">Download</button>
                </td>
              </tr>
              <tr>
                <td>Oct 1, 2023</td>
                <td>Professional Plan - Monthly</td>
                <td>$49.99</td>
                <td>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                    Paid
                  </span>
                </td>
                <td>
                  <button className="text-primary hover:underline">Download</button>
                </td>
              </tr>
              <tr>
                <td>Sep 1, 2023</td>
                <td>Professional Plan - Monthly</td>
                <td>$49.99</td>
                <td>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                    Paid
                  </span>
                </td>
                <td>
                  <button className="text-primary hover:underline">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;