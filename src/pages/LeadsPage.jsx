import React, { useState, useEffect } from 'react';
import { getLeads, updateLeadStatus } from '../api/leadsApi';
import toast from 'react-hot-toast';
import { Search, Download, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import authApi from '../api/authApi';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads({
        page,
        limit,
        type,
        status,
        search,
        startDate,
        endDate
      });
      setLeads(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      }
    } catch (err) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, limit, type, status, search, startDate, endDate]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateLeadStatus(id, newStatus);
      toast.success('Status updated');
      fetchLeads(); // refresh
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        type, status, search, startDate, endDate, export: 'true'
      }).toString();
      
      const response = await authApi.get(`/contact/submissions?${params}`);
      
      if (response.data && response.data.data) {
        const rows = response.data.data;
        if (rows.length === 0) {
          toast.info('No data to export');
          return;
        }

        const headers = ['Type', 'Status', 'Date', 'Name', 'Email', 'Phone', 'Company', 'Acreage', 'Products', 'Message'];
        const csvContent = [
          headers.join(','),
          ...rows.map(row => {
            return [
              row.type,
              row.status,
              new Date(row.createdAt).toLocaleDateString(),
              `"${(row.fullName || '').replace(/"/g, '""')}"`,
              `"${(row.email || '').replace(/"/g, '""')}"`,
              `"${(row.phone || '').replace(/"/g, '""')}"`,
              `"${(row.company || '').replace(/"/g, '""')}"`,
              `"${(row.acreage || '').replace(/"/g, '""')}"`,
              `"${(row.products ? row.products.map(p => typeof p.name === 'object' ? p.name?.en : p.name).join(', ') : '').replace(/"/g, '""')}"`,
              `"${(row.message || '').replace(/"/g, '""')}"`
            ].join(',');
          })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `leads_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leads & Inquiries</h1>
          <p className="text-sm text-gray-500">Manage all contact and bulk order submissions</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#144d18] transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {['all', 'contact', 'bulkorder'].map(t => (
          <button
            key={t}
            onClick={() => { setType(t); setPage(1); }}
            className={`pb-2 px-1 capitalize font-medium transition-all ${type === t ? 'text-[#1B5E20] border-b-2 border-[#1B5E20]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'bulkorder' ? 'Bulk Order' : t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B5E20]"
          />
        </div>
        
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1B5E20] bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5E20]"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B5E20]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No leads found.</td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{lead.fullName}</div>
                      {lead.company && <div className="text-xs text-gray-500 mt-1">{lead.company}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{lead.email}</div>
                      <div>{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${lead.type === 'bulkorder' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {lead.type === 'bulkorder' ? 'Bulk Order' : 'Contact'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`text-xs font-bold rounded-full px-2 py-1 border-0 ${
                          lead.status === 'new' ? 'bg-green-100 text-green-700' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        } cursor-pointer outline-none focus:ring-2`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedLead(lead)}
                        className="text-gray-400 hover:text-[#1B5E20] transition-colors p-1"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} leads
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1 rounded bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium px-2">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => p + 1)}
              className="p-1 rounded bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Lead Details</h2>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="font-medium text-gray-900">{selectedLead.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                          selectedLead.status === 'new' ? 'bg-green-100 text-green-700' :
                          selectedLead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                    {selectedLead.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-medium text-gray-900">{selectedLead.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{selectedLead.phone}</p>
                </div>
                {selectedLead.company && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Company</p>
                    <p className="font-medium text-gray-900">{selectedLead.company}</p>
                  </div>
                )}
                {selectedLead.acreage && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Acreage</p>
                    <p className="font-medium text-gray-900">{selectedLead.acreage}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date Submitted</p>
                  <p className="font-medium text-gray-900">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
                {selectedLead.products && selectedLead.products.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Interested Products</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.products.map(p => {
                         const name = typeof p.name === 'object' ? (p.name?.en || 'Product') : (p.name || 'Product');
                         return (
                           <span key={p._id} className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                             {name}
                           </span>
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Message</p>
                <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                  {selectedLead.message || 'No message provided.'}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
