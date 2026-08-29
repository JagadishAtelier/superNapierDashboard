import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, ChevronDown, ChevronUp, Globe, Award, DollarSign, ShoppingBag, Loader2, IndianRupee } from 'lucide-react';
import { getDistributionMap } from '../api/dashboardApi';
import ReactDatamaps from 'react-india-states-map';
import toast from 'react-hot-toast';

export default function DistributionMapPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState(null);
  const [expandedStates, setExpandedStates] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDistributionMap();
        if (response.success) {
          setData(response.data || []);
        } else {
          toast.error("Failed to fetch distribution map data");
        }
      } catch (err) {
        console.error("Distribution map fetch error:", err);
        toast.error("Error loading geographical sales distribution");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (stateName) => {
    setExpandedStates(prev => ({
      ...prev,
      [stateName]: !prev[stateName]
    }));
  };

  const filteredData = data.filter(item =>
    item.state.toLowerCase().includes(search.toLowerCase())
  );

  // Totals calculations
  const totalStates = data.length;
  const totalSales = data.reduce((acc, curr) => acc + curr.totalSales, 0);
  const totalOrders = data.reduce((acc, curr) => acc + curr.totalOrders, 0);
  const topState = data.length > 0 ? data[0] : null;

  // Build regionData for react-india-states-map
  const regionData = {};
  data.forEach(item => {
    regionData[item.state] = {
      value: item.totalSales,
      orders: item.totalOrders,
      cities: item.cities
    };
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Back & Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="p-3 bg-gray-50 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Order Distribution Map</h1>
          <p className="text-gray-500 text-sm font-medium">Real-time geographic orders & sales analysis across India</p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Globe size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">States Reached</span>
            <span className="text-xl font-bold text-gray-800">{loading ? '...' : totalStates}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <IndianRupee size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Map Sales</span>
            <span className="text-xl font-bold text-gray-800">{loading ? '...' : `₹${totalSales.toLocaleString()}`}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Map Orders</span>
            <span className="text-xl font-bold text-gray-800">{loading ? '...' : totalOrders.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Top Region</span>
            <span className="text-xl font-bold text-gray-800 truncate max-w-[150px] block">
              {loading ? '...' : (topState ? topState.state : 'None')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin w-12 h-12 text-emerald-600 opacity-60 mb-4" />
          <p className="text-gray-500 font-bold">Aggregating geographical coordinates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: State list and details (Col span 2) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-[650px]">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white outline-none transition-all font-semibold text-gray-700"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-bold">No state sales records found</p>
                </div>
              ) : (
                filteredData.map((item, idx) => {
                  const isSelected = selectedState?.state === item.state;
                  const isExpanded = expandedStates[item.state];
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedState(item)}
                      className={`border rounded-2xl p-4 transition-all duration-300 cursor-pointer ${isSelected
                        ? 'border-emerald-500 bg-emerald-50/20 shadow-md shadow-emerald-500/5'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400'} transition-colors`}>
                            <MapPin size={16} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-gray-800 uppercase text-xs tracking-wider">{item.state}</h3>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{item.totalOrders} Orders</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-gray-900">₹{item.totalSales.toLocaleString()}</span>
                          <div className="flex items-center gap-1.5 justify-end mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(item.state);
                              }}
                              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* City details drill-down */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200/80 space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">City Breakdown</p>
                          {item.cities.map((c, cIdx) => (
                            <div key={cIdx} className="flex justify-between items-center text-xs bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                              <span className="text-gray-600 font-bold uppercase tracking-wide">{c.city}</span>
                              <div className="text-right flex items-center gap-4">
                                <span className="text-gray-400 font-semibold">{c.orders} orders</span>
                                <span className="text-gray-800 font-extrabold">₹{c.sales.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Map view card (Col span 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-between h-[650px] relative overflow-hidden">
            {/* Overlay detail panel */}
            <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-lg max-w-[240px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Map Information</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Hover state regions to inspect sales performance. Click any state to view details and city listings.
              </p>
              {selectedState && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{selectedState.state}</p>
                  <p className="text-sm font-black text-gray-800 mt-1">₹{selectedState.totalSales.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{selectedState.totalOrders} Orders</p>
                </div>
              )}
            </div>

            {/* India Choropleth Map Visualization */}
            <div className="w-full flex-1 flex items-center justify-center relative select-none" style={{ minHeight: '480px' }}>
              <ReactDatamaps
                regionData={regionData}
                mapLayout={{
                  hoverTitle: "Sales",
                  noDataColor: "#f8fafc",
                  borderColor: "#e2e8f0",
                  hoverBorderColor: "#10b981",
                  hoverColor: "#d1fae5",
                }}
                hoverComponent={({ value }) => {
                  if (!value) return null;
                  const stateName = value.name;
                  const matchedKey = Object.keys(regionData).find(
                    k => k.toLowerCase() === stateName.toLowerCase()
                  );
                  const stateStats = matchedKey ? regionData[matchedKey] : { value: 0, orders: 0 };
                  return (
                    <div className="bg-gray-900 text-white text-[11px] rounded-xl p-3 shadow-lg border border-gray-800 pointer-events-none z-50">
                      <p className="font-extrabold text-emerald-400 uppercase tracking-wider">{stateName}</p>
                      <p className="text-gray-200 mt-1 font-semibold">Sales: ₹{(stateStats.value || 0).toLocaleString()}</p>
                      <p className="text-gray-400 text-[10px] font-bold uppercase">Orders: {stateStats.orders || 0}</p>
                    </div>
                  );
                }}
                onClick={(dataItem, name) => {
                  const matchedKey = Object.keys(regionData).find(
                    k => k.toLowerCase() === name.toLowerCase()
                  );
                  const stateStats = matchedKey ? regionData[matchedKey] : { value: 0, orders: 0, cities: [] };
                  setSelectedState({
                    state: name,
                    totalSales: stateStats.value,
                    totalOrders: stateStats.orders,
                    cities: stateStats.cities || []
                  });
                  setExpandedStates(prev => ({ ...prev, [name]: true }));
                }}
                activeState={selectedState ? { name: selectedState.state } : null}
              />
            </div>

            {/* Visual Indicator footer */}
            <div className="flex items-center gap-6 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active fulfillment regions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-300"></span>
                <span>Non-fulfillment areas</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
