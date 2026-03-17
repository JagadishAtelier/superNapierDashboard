import { X } from "lucide-react";

export default function CampaignModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">Create New Campaign</h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Campaign Name"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Budget ($)"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              className="w-full sm:w-1/2 border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="date"
              className="w-full sm:w-1/2 border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500"
          >
            Launch Campaign
          </button>
        </form>
      </div>
    </div>
  );
}
