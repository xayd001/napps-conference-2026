import React, { useState, useEffect, useRef } from 'react';
import { getStakeholders, getPartners } from '../services/dataService';
import { BarChart3, Users, ShieldCheck, Armchair, Landmark, Download, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function OperationalAnalytics() {
  const [stakeholders, setStakeholders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sData, pData] = await Promise.all([getStakeholders(), getPartners()]);
      setStakeholders(sData || []);
      setPartners(pData || []);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculations
  const totalStakeholders = stakeholders.length;
  const checkedInCount = stakeholders.filter((s) => s.checkedIn || s.status === 'Checked-In').length;
  const seatedCount = stakeholders.filter((s) => s.seatingAssignment).length;
  const totalPartners = partners.length;
  const totalPledges = partners.reduce((acc, p) => acc + (parseFloat(p.pledgeAmount) || 0), 0);

  const checkInRate = totalStakeholders > 0 ? Math.round((checkedInCount / totalStakeholders) * 100) : 0;
  const seatingRate = totalStakeholders > 0 ? Math.round((seatedCount / totalStakeholders) * 100) : 0;

  // PDF Generation Function
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`NAPPS2026_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF report:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900">Operational Intelligence & Executive Reports</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating PDF...' : 'Export Executive PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas Area */}
      <div ref={reportRef} className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        {/* Banner Header */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded">
                Official Operations Report
              </span>
              <h1 className="text-xl font-black mt-1">NAPPSCONFERENCE2026 Metrics</h1>
              <p className="text-xs text-slate-400">Live operational status and VIP attendance analytics.</p>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Venue: Maiduguri, Borno State</p>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] font-bold uppercase">Total Delegates</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalStakeholders}</p>
            <p className="text-[10px] text-slate-400">Registered VIPs & Guests</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] font-bold uppercase">Security Verified</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{checkedInCount}</p>
            <p className="text-[10px] font-semibold text-emerald-600">{checkInRate}% Checked-In</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] font-bold uppercase">Seats Allocated</span>
              <Armchair className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{seatedCount}</p>
            <p className="text-[10px] font-semibold text-indigo-600">{seatingRate}% Assigned</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] font-bold uppercase">Partner Pledges</span>
              <Landmark className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">₦{totalPledges.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">{totalPartners} Support Partners</p>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Attendance Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {['NAPPS Executives', 'Government Officials', 'Development Partners', 'Traditional Rulers'].map((cat) => {
              const count = stakeholders.filter((s) => s.category === cat).length;
              return (
                <div key={cat} className="bg-white p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-semibold">{cat}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}