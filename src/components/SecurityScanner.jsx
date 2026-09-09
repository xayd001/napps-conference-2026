import React, { useState, useEffect, useRef } from 'react';
import { getStakeholders, updateStakeholder } from '../services/dataService';
import { ShieldCheck, QrCode, Search, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function SecurityScanner() {
  const [stakeholders, setStakeholders] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [scanStatus, setScanStatus] = useState(null); // 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStakeholders();
  }, []);

  const loadStakeholders = async () => {
    setLoading(true);
    try {
      const data = await getStakeholders();
      setStakeholders(data || []);
    } catch (err) {
      console.error('Error fetching stakeholders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndCheckIn = async (tokenOrName) => {
    if (!tokenOrName.trim()) return;

    const matched = stakeholders.find(
      (s) =>
        s.qrCodeToken?.toLowerCase() === tokenOrName.trim().toLowerCase() ||
        s.name?.toLowerCase().includes(tokenOrName.trim().toLowerCase())
    );

    if (!matched) {
      setScanStatus('error');
      setStatusMessage('Invalid QR Pass: Delegate record not found in system.');
      setScannedResult(null);
      return;
    }

    if (matched.checkedIn || matched.status === 'Checked-In') {
      setScanStatus('error');
      setStatusMessage(`Already Checked-In at ${matched.checkInTime || 'earlier session'}`);
      setScannedResult(matched);
      return;
    }

    // Process Check-In
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await updateStakeholder(matched.id, {
        checkedIn: true,
        status: 'Checked-In',
        checkInTime: timeString
      });

      setScanStatus('success');
      setStatusMessage(`Security Clearance Granted. Welcome, ${matched.name}!`);
      setScannedResult({ ...matched, checkedIn: true, status: 'Checked-In', checkInTime: timeString });
      loadStakeholders();
      setSearchInput('');
    } catch (err) {
      console.error('Check-in failed:', err);
      setScanStatus('error');
      setStatusMessage('Database write error during check-in.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Access Control</span>
          </div>
          <h2 className="text-xl font-black">Hall Entrance & Security Verification</h2>
          <p className="text-xs text-slate-400">Scan delegate QR code tokens or search by name to log session entrance.</p>
        </div>
        <button
          onClick={loadStakeholders}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Input Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4 text-sky-600" />
            Manual Token or Delegate Search
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scan / Enter Token or Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyAndCheckIn(searchInput)}
                  placeholder="e.g. TOKEN_AMINA_BELLO_2026"
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              onClick={() => handleVerifyAndCheckIn(searchInput)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Log Entry</span>
            </button>
          </div>
        </div>

        {/* Scan Result Feedback Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center text-center">
          {scanStatus === 'success' && (
            <div className="space-y-3">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Access Granted</h4>
              <p className="text-xs text-emerald-600 font-semibold">{statusMessage}</p>
              {scannedResult && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1 mt-2">
                  <p className="font-bold text-slate-900">{scannedResult.name}</p>
                  <p className="text-slate-500">{scannedResult.category} &bull; {scannedResult.organization}</p>
                  <p className="font-mono text-sky-600 text-[11px]">{scannedResult.seatingAssignment || 'Unassigned Seat'}</p>
                </div>
              )}
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="space-y-3">
              <div className="inline-flex p-3 bg-rose-100 text-rose-600 rounded-full">
                <XCircle className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Verification Failed</h4>
              <p className="text-xs text-rose-600 font-semibold">{statusMessage}</p>
            </div>
          )}

          {!scanStatus && (
            <div className="space-y-2 text-slate-400">
              <AlertCircle className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-xs font-semibold">Awaiting QR Pass Scan or Manual Entry...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}