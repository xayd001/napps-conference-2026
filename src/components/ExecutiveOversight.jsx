import React, { useState, useEffect } from 'react';
import { getStakeholders, getPartners } from '../services/dataService';
import { Crown, Users, ShieldCheck, Armchair, Landmark, ArrowUpRight, FileSpreadsheet } from 'lucide-react';

export default function ExecutiveOversight() {
  const [stakeholders, setStakeholders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExecutiveData() {
      setLoading(true);
      try {
        const [sData, pData] = await Promise.all([getStakeholders(), getPartners()]);
        setStakeholders(sData || []);
        setPartners(pData || []);
      } catch (err) {
        console.error('Executive oversight data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExecutiveData();
  }, []);

  const totalStakeholders = stakeholders.length;
  const checkedInCount = stakeholders.filter((s) => s.checkedIn || s.status === 'Checked-In').length;
  const vipsCount = stakeholders.filter((s) => s.category === 'NAPPS Executives' || s.category === 'Government Officials').length;
  const totalPledges = partners.reduce((acc, p) => acc + (parseFloat(p.pledgeAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Executive Brief Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white p-8 rounded-3xl shadow-xl border border-slate-800 flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400">
            <Crown className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">LOC Leadership Portal</span>
          </div>
          <h1 className="text-2xl font-black">Executive Oversight Brief</h1>
          <p className="text-xs text-slate-300">Live high-level metrics prepared for the Local Organizing Committee Chairman.</p>
        </div>

        <div className="hidden sm:block text-right border-l border-slate-700 pl-6">
          <p className="text-xs font-bold text-slate-300">Status: Active Operational Phase</p>
          <p className="text-[10px] text-sky-400 font-mono mt-1">NAPPSCONFERENCE2026</p>
        </div>
      </div>

      {/* Primary High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase">Total Attendance</span>
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalStakeholders}</p>
          <p className="text-[10px] font-semibold text-sky-600 flex items-center gap-1">
            <span>{vipsCount} High-Level VIPs</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase">Hall Venue Density</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{checkedInCount}</p>
          <p className="text-[10px] font-semibold text-emerald-600">
            {totalStakeholders > 0 ? Math.round((checkedInCount / totalStakeholders) * 100) : 0}% Security Verified
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase">Financial Pledges</span>
            <Landmark className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">₦{totalPledges.toLocaleString()}</p>
          <p className="text-[10px] font-semibold text-amber-600">{partners.length} Supporting Partners</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase">Hall Seating</span>
            <Armchair className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {stakeholders.filter((s) => s.seatingAssignment).length}
          </p>
          <p className="text-[10px] text-slate-400">Reserved seat allocations</p>
        </div>
      </div>
    </div>
  );
}