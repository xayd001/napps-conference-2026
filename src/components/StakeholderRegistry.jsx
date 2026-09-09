import React, { useState, useEffect } from 'react';
import { subscribeStakeholders, addStakeholder } from '../services/dataService';
import { Users, UserPlus, Search, QrCode, Filter, CheckCircle2, Clock } from 'lucide-react';

export default function StakeholderRegistry() {
  const [stakeholders, setStakeholders] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Traditional Rulers',
    organization: '',
    phone: '',
    status: 'Confirmed',
    qrCodeToken: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeStakeholders((data) => {
      setStakeholders(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Generate auto QR token if blank
    const token = formData.qrCodeToken || `TOKEN_${formData.name.toUpperCase().replace(/\s+/g, '_')}_2026`;
    
    await addStakeholder({
      ...formData,
      qrCodeToken: token
    });

    setFormData({
      name: '',
      category: 'Traditional Rulers',
      organization: '',
      phone: '',
      status: 'Confirmed',
      qrCodeToken: ''
    });
    setShowModal(false);
  };

  const filteredStakeholders = stakeholders.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) ||
                          item.organization?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between border border-slate-800">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded mb-1">
            Master Database
          </span>
          <h2 className="text-xl font-black">Stakeholder & VIP Registry</h2>
          <p className="text-xs text-slate-400 mt-1">Manage guest accreditations, contact profiles, and security verification tokens.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register VIP</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or organization..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Traditional Rulers">Traditional Rulers</option>
            <option value="Government Officials">Government Officials</option>
            <option value="Development Partners">Development Partners</option>
            <option value="NAPPS Executives">NAPPS Executives</option>
          </select>
        </div>
      </div>

      {/* Stakeholders Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Organization</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">QR Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStakeholders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No stakeholders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredStakeholders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-sky-50 text-sky-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-100">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.organization || '—'}</td>
                    <td className="px-6 py-4 font-mono text-[11px]">{item.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.status === 'Confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-slate-400" />
                        {item.qrCodeToken}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Stakeholder / VIP</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. His Royal Highness..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                >
                  <option value="Traditional Rulers">Traditional Rulers</option>
                  <option value="Government Officials">Government Officials</option>
                  <option value="Development Partners">Development Partners</option>
                  <option value="NAPPS Executives">NAPPS Executives</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Organization / Title</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Borno Emirate Council"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm"
                >
                  Save Stakeholder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}