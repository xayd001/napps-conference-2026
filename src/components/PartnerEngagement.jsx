import React, { useState, useEffect } from 'react';
import { subscribeToStakeholders, updateStakeholder } from '../services/stakeholderService';
import { subscribeToCSR, addCSRPledge, updateCSRPledge, deleteCSRPledge } from '../services/engagementService';
import { Landmark, Handshake, Plus, Edit2, Trash2, DollarSign, CheckCircle2, Clock, Mail } from 'lucide-react';

const PIPELINE_STAGES = [
  'Letter Sent',
  'Courtesy Visit Scheduled',
  'Confirmed',
  'Declined'
];

export default function PartnerEngagement() {
  const [stakeholders, setStakeholders] = useState([]);
  const [csrPledges, setCsrPledges] = useState([]);
  const [activeView, setActiveView] = useState('pipeline'); // 'pipeline' | 'csr'

  // Modal State for CSR Ledger
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    partnerName: '',
    supportType: 'Financial', // 'Financial' | 'Technical' | 'Material' | 'CSR Pledge'
    amount: '',
    description: '',
    status: 'Pledged' // 'Pledged' | 'Received' | 'In Progress'
  });

  useEffect(() => {
    const unsubStakeholders = subscribeToStakeholders(setStakeholders);
    const unsubCSR = subscribeToCSR(setCsrPledges);
    return () => {
      unsubStakeholders();
      unsubCSR();
    };
  }, []);

  // Update pipeline stage for government official or traditional ruler
  const handleStageChange = async (stakeholderId, newStatus) => {
    await updateStakeholder(stakeholderId, { status: newStatus });
  };

  const handleCSRSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateCSRPledge(editingId, formData);
    } else {
      await addCSRPledge(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      partnerName: '',
      supportType: 'Financial',
      amount: '',
      description: '',
      status: 'Pledged'
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEditCSR = (item) => {
    setFormData({
      partnerName: item.partnerName,
      supportType: item.supportType,
      amount: item.amount,
      description: item.description,
      status: item.status
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  // Filter only Government Officials and Royal/Traditional Rulers for pipeline
  const pipelineStakeholders = stakeholders.filter(
    s => s.category === 'Government Official' || s.category === 'Traditional Ruler'
  );

  const totalFinancialSupport = csrPledges
    .filter(p => p.status === 'Received')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPledged = csrPledges
    .filter(p => p.status === 'Pledged')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-sky-600" />
            Government & Partner Engagement Dashboard
          </h2>
          <p className="text-xs text-slate-500">Track high-level diplomatic outreach pipelines, CSR pledges, and partner support</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveView('pipeline')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeView === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Engagement Pipeline
          </button>
          <button
            onClick={() => setActiveView('csr')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeView === 'csr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Support & CSR Ledger
          </button>
        </div>
      </div>

      {/* VIEW 1: STAKEHOLDER ENGAGEMENT PIPELINE */}
      {activeView === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageItems = pipelineStakeholders.filter(s => s.status === stage);
            return (
              <div key={stage} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col space-y-3 min-h-[450px]">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage}</h3>
                  <span className="text-[10px] font-extrabold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {stageItems.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  {stageItems.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-8">No dignitaries in this stage</p>
                  ) : (
                    stageItems.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                          <p className="text-[10px] text-slate-500">{item.organization}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>

                        {/* Move Stage Selector */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <label className="text-[9px] text-slate-400 font-bold uppercase">Stage:</label>
                          <select
                            value={item.status}
                            onChange={(e) => handleStageChange(item.id, e.target.value)}
                            className="text-[10px] font-semibold bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            {PIPELINE_STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: SUPPORT & CSR LEDGER */}
      {activeView === 'csr' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Funds Received</p>
                <h3 className="text-xl font-black text-emerald-600 mt-1">
                  ₦{totalFinancialSupport.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Pledged Support</p>
                <h3 className="text-xl font-black text-amber-600 mt-1">
                  ₦{totalPledged.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Total Partners Logged</p>
                <h3 className="text-xl font-black text-slate-900 mt-1">{csrPledges.length}</h3>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log Support</span>
              </button>
            </div>
          </div>

          {/* CSR Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Partner / NGO / Corporate Body</th>
                    <th className="p-3">Support Type</th>
                    <th className="p-3">Value / Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {csrPledges.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">
                        No support or CSR pledges logged yet.
                      </td>
                    </tr>
                  ) : (
                    csrPledges.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{item.partnerName}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.supportType}
                          </span>
                        </td>
                        <td className="p-3">
                          {item.amount > 0 && (
                            <span className="font-bold text-emerald-700 block">
                              ₦{item.amount.toLocaleString()}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">{item.description}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'Pledged' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => handleEditCSR(item)} className="p-1.5 text-slate-600 hover:text-sky-600 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCSRPledge(item.id)} className="p-1.5 text-slate-600 hover:text-red-600 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding/editing CSR entries */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Partner Support' : 'Log Partner Support / CSR'}
            </h3>
            <form onSubmit={handleCSRSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Partner / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., UNICEF, Shell, State Ministry"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Support Type</label>
                  <select
                    value={formData.supportType}
                    onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Financial">Financial</option>
                    <option value="Technical">Technical Assistance</option>
                    <option value="Material">Material Support</option>
                    <option value="CSR Pledge">CSR Pledge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Pledged">Pledged</option>
                    <option value="Received">Received</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (NGN, if financial)</label>
                <input
                  type="number"
                  placeholder="e.g., 5000000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pledge / Support Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe material provided or details of assistance..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  {editingId ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}