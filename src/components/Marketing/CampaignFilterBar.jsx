import { Search } from "lucide-react";

export default function CampaignFilterBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="relative w-full sm:w-64">
        <input
          type="text"
          placeholder="Search campaigns"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 px-4 pr-10 border rounded-md text-sm focus:ring-indigo-500"
        />
        <Search
          size={16}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
        />
      </div>
      {/* Additional filters can go here */}
    </div>
  );
}
