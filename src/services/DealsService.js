/**
 * DealsService.js
 * Provides functionality for managing deals in the CRM
 */

// Default deal stages
export const DEAL_STAGES = [
  { id: 'lead', name: 'Lead', color: 'blue' },
  { id: 'qualified', name: 'Qualified', color: 'indigo' },
  { id: 'proposal', name: 'Proposal', color: 'purple' },
  { id: 'negotiation', name: 'Negotiation', color: 'amber' },
  { id: 'closed_won', name: 'Closed Won', color: 'green' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'red' }
];

// Default sample deals data
const SAMPLE_DEALS = [
  {
    id: "deal1",
    title: "Enterprise Software License",
    contactId: "1", // Reference to Sarah Johnson
    amount: 75000,
    stage: "proposal",
    probability: 60,
    expectedCloseDate: "2023-09-30",
    createdAt: "2023-06-20T10:32:00",
    updatedAt: "2023-08-15T14:22:00",
    ownerId: "Current User",
    description: "Annual software license renewal with potential upgrade to premium tier.",
    activities: [
      {
        id: "act1",
        type: "call",
        description: "Discussed upgrade options",
        date: "2023-08-10T11:15:00",
        userId: "Current User"
      }
    ],
    tags: ["renewal", "upsell"]
  },
  {
    id: "deal2",
    title: "Retail Solution Implementation",
    contactId: "2", // Reference to David Chen
    amount: 45000,
    stage: "lead",
    probability: 30,
    expectedCloseDate: "2023-11-15",
    createdAt: "2023-07-25T09:45:00",
    updatedAt: "2023-07-28T16:30:00",
    ownerId: "Current User", 
    description: "New point-of-sale system implementation for multiple retail locations.",
    activities: [],
    tags: ["new-business"]
  },
  {
    id: "deal3",
    title: "Hospitality Management System",
    contactId: "3", // Reference to Miguel Rodriguez
    amount: 120000,
    stage: "qualified",
    probability: 45,
    expectedCloseDate: "2023-10-30",
    createdAt: "2023-06-05T13:20:00",
    updatedAt: "2023-07-18T11:05:00",
    ownerId: "David Lee",
    description: "Comprehensive hotel management system with booking, staff, and inventory modules.",
    activities: [
      {
        id: "act2",
        type: "meeting",
        description: "Product demo and requirements gathering",
        date: "2023-07-12T14:00:00",
        userId: "David Lee"
      }
    ],
    tags: ["large-deal", "hospitality"]
  }
];

class DealsService {
  constructor() {
    this.init();
  }

  init() {
    // Initialize with stored deals or sample data
    const storedDeals = localStorage.getItem('crm-deals');
    if (!storedDeals) {
      localStorage.setItem('crm-deals', JSON.stringify(SAMPLE_DEALS));
    }
  }

  getAllDeals() {
    const dealsJson = localStorage.getItem('crm-deals');
    return dealsJson ? JSON.parse(dealsJson) : [];
  }

  getDealsByContact(contactId) {
    const allDeals = this.getAllDeals();
    return allDeals.filter(deal => deal.contactId === contactId);
  }

  getDealById(dealId) {
    const allDeals = this.getAllDeals();
    return allDeals.find(deal => deal.id === dealId) || null;
  }

  addDeal(dealData) {
    const allDeals = this.getAllDeals();
    const newDeal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: []
    };
    
    allDeals.push(newDeal);
    localStorage.setItem('crm-deals', JSON.stringify(allDeals));
    return newDeal;
  }

  updateDeal(dealId, updatedData) {
    const allDeals = this.getAllDeals();
    const dealIndex = allDeals.findIndex(deal => deal.id === dealId);
    
    if (dealIndex !== -1) {
      allDeals[dealIndex] = {
        ...allDeals[dealIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('crm-deals', JSON.stringify(allDeals));
      return allDeals[dealIndex];
    }
    
    return null;
  }

  deleteDeal(dealId) {
    const allDeals = this.getAllDeals();
    const updatedDeals = allDeals.filter(deal => deal.id !== dealId);
    
    localStorage.setItem('crm-deals', JSON.stringify(updatedDeals));
    return true;
  }
}

// Export singleton instance
export default new DealsService();