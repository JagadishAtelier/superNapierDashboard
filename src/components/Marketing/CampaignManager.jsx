import { useState } from "react";
import { Plus } from "lucide-react";
import CampaignCard from "./CampaignCard";
import CampaignModal from "./CampaignModal";
import CampaignFilterBar from "./CampaignFilterBar";

const mockCampaigns = [
  {
    id: 1,
    name: "Summer Flash Sale",
    status: "Active",
    budget: 5000,
    spent: 3200,
    ctr: 4.2,
    conversions: 150,
    startDate: "2025-06-01",
    endDate: "2025-06-10",
  },
  {
    id: 2,
    name: "Father's Day Promo",
    status: "Inactive",
    budget: 3000,
    spent: 2900,
    ctr: 3.1,
    conversions: 90,
    startDate: "2025-06-05",
    endDate: "2025-06-15",
  },
  {
    id: 3,
    name: "Summer Flash Sale",
    status: "Active",
    budget: 5000,
    spent: 3200,
    ctr: 4.2,
    conversions: 150,
    startDate: "2025-06-01",
    endDate: "2025-06-10",
  },
];

export default function CampaignManager() {
  const [campaigns, _setCampaigns] = useState(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold">Campaign Manager</h2>
        <button
          className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500 min-w-[140px] sm:min-w-[auto]"
          onClick={() => setShowModal(true)}
          aria-label="Create new campaign"
          type="button"
        >
          <Plus size={18} />
          <span className="inline">New Campaign</span>
        </button>
      </div>

      <div className="mb-6">
        <CampaignFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          className="w-full"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 mt-20">
          No campaigns found matching &quot;{searchTerm}&quot;.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      <CampaignModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
