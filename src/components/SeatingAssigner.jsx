import React, { useState, useEffect } from 'react';
import { getStakeholders, updateStakeholder } from '../services/dataService';
import { Armchair, Check, User, AlertCircle, RefreshCw } from 'lucide-react';

const SEATING_ZONES = [
  { id: 'zone-a', name: 'Zone A - High Table & Royal VIPs', totalSeats: 20 },
  { id: 'zone-b', name: 'Zone B - Government & Executive Council', totalSeats: 40 },
  { id: 'zone-c', name: 'Zone C - Development Partners', totalSeats: 30 },
  { id: 'zone-d', name: 'Zone D - General Delegates', totalSeats: 100 }
];

export default function SeatingAssigner() {
  const [stakeholders, setStakeholders] = useState([]);
  const [selectedZone, setSelectedZone] = useState('zone-a');
  const [selectedDelegate, setSelectedDelegate] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getStakeholders();
      setStakeholders(data || []);
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSeat = async (e) => {
    e.preventDefault();
    if (!selectedDelegate || !seatNumber) return;

    setAssigning(true);
    try {
      const zoneObj = SEATING_ZONES.find((z) => z.id === selectedZone);
      const seatingString = `${zoneObj.name.split(' - ')[0]} | Seat ${seatNumber}`;

      await updateStakeholder(selectedDelegate, {
        seatingAssignment: seatingString,
        seatingZone: selectedZone,
        seatNumber: seatNumber
      });

      await loadData();
      setSeatNumber('');
      setSelectedDelegate('');
    } catch (error) {
      console.error('Failed to assign seat:', error);
    } finally {
      setAssigning(false);
    }
  };

  const unassignedDelegates = stakeholders.filter((s) => !s.seatingAssignment);
  const assignedDelegates = stakeholders.filter((s) => s.seatingAssignment);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-sky-600" />
            Hall Seating Protocol Manager
          </h2>
          <p className="text-xs text-slate-500">
            Allocate reserved hall seats to VIPs and track overall capacity in real time.
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2">
            Assign Seat
          </h3>

          <form onSubmit={handleAssignSeat} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Delegate ({unassignedDelegates.length} Unassigned)
              </label>
              <select
                value={selectedDelegate}
                onChange={(e) => setSelectedDelegate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                required
              >
                <option value="">-- Choose Delegate --</option>
                {unassignedDelegates.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Seating Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                {SEATING_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Seat / Table Number</label>
              <input
                type="text"
                placeholder="e.g. A-01, Table 3 Seat 2"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={assigning || !selectedDelegate}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Confirm Seating Allocation'}
            </button>
          </form>
        </div>

        {/* Assigned Seating Roster */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex justify-between items-center">
            <span>Allocated Seats Roster</span>
            <span className="text-sky-600 font-mono text-xs">{assignedDelegates.length} Assigned</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 bg-slate-50">
                  <th className="p-2.5">Delegate Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Assigned Seat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {assignedDelegates.length > 0 ? (
                  assignedDelegates.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {s.category}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-sky-600">{s.seatingAssignment}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-400">
                      No seats allocated yet. Use the form to assign seats.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}