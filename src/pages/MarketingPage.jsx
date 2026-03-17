import React from 'react';
import CampaignStats from '../components/Marketing/CampaignStats';
import CampaignFilterBar from '../components/Marketing/CampaignFilterBar';
import CampaignManager from '../components/Marketing/CampaignManager';
const sampleStats = {
  totalBudget: 10000,
  totalSpent: 7200,
  totalConversions: 1450,
  ctr: 3.9,
  dailyPerformance: [
    { date: 'Jun 1', spent: 300, ctr: 3.1 },
    { date: 'Jun 2', spent: 450, ctr: 4.0 },
    { date: 'Jun 3', spent: 350, ctr: 3.5 },
    { date: 'Jun 4', spent: 420, ctr: 4.2 },
    { date: 'Jun 5', spent: 460, ctr: 3.8 },
    { date: 'Jun 6', spent: 380, ctr: 3.9 },
  ],
};

export default function MarketingPage() {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Marketing Dashboard</h1>
      


      {/* Filter bar for campaigns
      <CampaignFilterBar /> */}

      {/* Main campaign management panel */}
      <CampaignManager />
            {/* Stats summary at the top */}
      <CampaignStats stats={sampleStats} />
    </div>
  );
}
