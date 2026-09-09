import React, { useEffect, useState } from 'react';
import { subscribeProtocolLogs, updateProtocolLog } from '../services/dataService';
import { PlaneTakeoff, Car, Building2, ShieldCheck, Search, CheckCircle } from 'lucide-react';

export default function ProtocolTracker() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeProtocolLogs((data) => {
      setLogs(data);
    });
    return () => unsubscribe();
  }, []);

  const toggleEscort = async (logId, currentStatus) => {
    setLoadingId(logId);
    try {
      await updateProtocolLog(logId, { escortRequired: !currentStatus });
    } catch (err) {
      console.error('Failed to update escort requirement', err);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredLogs = logs.filter(item =>
    item.stakeholderId?.toLowerCase().includes(search.toLowerCase()) ||
    item.entryPoint?.toLowerCase().includes(search.toLowerCase()) ||
    item.hotel?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between border border-slate-800">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded mb-1">
            Logistics & Security Management
          </span>
          <h2 className="text-xl font-black">VIP Protocol & Arrival Tracker</h2>
          <p className="text-xs text-slate-400 mt-1">Manage arrival checkpoints, assigned escort vehicles, and accommodation dispatch in real time.</p>
        </div>
        <div className="w-12 h-12 bg-sky-600/20 text-sky-400 rounded-xl flex items-center justify-center border border-sky-500/30">
          <PlaneTakeoff className="w-6 h-6" />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, entry point, or hotel..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Total Logs: <span className="text-slate-900 font-bold">{filteredLogs.length}</span>
        </span>
      </div>

      {/* Protocol Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stakeholder ID</span>
                <h3 className="text-xs font-bold text-slate-900">{log.stakeholderId}</h3>
              </div>
              <button
                onClick={() => toggleEscort(log.id, log.escortRequired)}
                disabled={loadingId === log.id}
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                  log.escortRequired
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{log.escortRequired ? 'Escort Active' : 'No Escort'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <PlaneTakeoff className="w-4 h-4 text-sky-600 shrink-0" />
                <span><strong className="text-slate-800">Entry:</strong> {log.entryPoint || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Car className="w-4 h-4 text-sky-600 shrink-0" />
                <span><strong className="text-slate-800">Vehicle:</strong> {log.vehicleAssigned || 'Unassigned'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span><strong className="text-slate-800">Hotel:</strong> {log.hotel || 'Pending'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Arrival: {log.arrivalDatetime ? new Date(log.arrivalDatetime).toLocaleString() : 'TBD'}</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}