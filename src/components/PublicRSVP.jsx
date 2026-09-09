import React, { useState } from 'react';
import { addStakeholder } from '../services/dataService';
import { generateQRCodeDataUrl, dispatchDigitalInvitation } from '../services/notificationService';
import { QrCode, CheckCircle2, Download, Send, UserCheck, Sparkles } from 'lucide-react';

export default function PublicRSVP() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    phone: '',
    email: '',
    category: 'NAPPS Executives'
  });

  const [loading, setLoading] = useState(false);
  const [rsvpComplete, setRsvpComplete] = useState(false);
  const [stakeholderData, setStakeholderData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const generatedToken = `TOKEN_${formData.name.toUpperCase().replace(/\s+/g, '_')}_2026`;

      const newStakeholder = {
        name: formData.name,
        organization: formData.organization,
        phone: formData.phone,
        email: formData.email,
        category: formData.category,
        status: 'Confirmed',
        qrCodeToken: generatedToken
      };

      // Save to database
      const docRef = await addStakeholder(newStakeholder);
      const createdItem = { id: docRef.id, ...newStakeholder };

      // Generate dynamic QR Code Data URL
      const qrUrl = await generateQRCodeDataUrl(generatedToken);

      setStakeholderData(createdItem);
      setQrCodeUrl(qrUrl);
      setRsvpComplete(true);
    } catch (error) {
      console.error('RSVP Submission Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!stakeholderData) return;
    setDispatchStatus('Sending digital badge via Email/SMS...');
    const result = await dispatchDigitalInvitation(stakeholderData);
    setDispatchStatus(result.message);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Public Banner */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800 text-center space-y-2">
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full">
          Official Registration Gateway
        </span>
        <h1 className="text-2xl sm:text-3xl font-black">NAPPSCONFERENCE2026</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Confirm your participation to receive your authenticated digital pass and dynamic venue security QR code.
        </p>
      </div>

      {!rsvpComplete ? (
        /* RSVP Form */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <UserCheck className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">Delegate RSVP Form</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name & Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Amina Bello"
                className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                >
                  <option value="NAPPS Executives">NAPPS Executives</option>
                  <option value="Government Officials">Government Officials</option>
                  <option value="Development Partners">Development Partners</option>
                  <option value="Traditional Rulers">Traditional Rulers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Institution</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Borno State Ministry of Education"
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (SMS Notifications)</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234..."
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="delegate@example.com"
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Confirming RSVP...' : 'Confirm RSVP & Generate Access Badge'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* RSVP Confirmation & Badge Display */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">RSVP Confirmed!</h2>
            <p className="text-xs text-slate-500 mt-1">Your registration pass has been successfully generated.</p>
          </div>

          {/* Digital Badge Preview */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl max-w-sm mx-auto shadow-lg border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center text-left">
              <div>
                <p className="text-[9px] text-sky-400 font-bold uppercase tracking-wider">Official Delegate Pass</p>
                <p className="text-xs font-bold">{stakeholderData.name}</p>
              </div>
              <span className="text-[9px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-bold">
                {stakeholderData.category}
              </span>
            </div>

            {/* QR Code Container */}
            {qrCodeUrl && (
              <div className="bg-white p-3 rounded-xl inline-block shadow-inner">
                <img src={qrCodeUrl} alt="Security QR Token" className="w-40 h-40 mx-auto" />
              </div>
            )}

            <p className="text-[10px] font-mono text-slate-400">{stakeholderData.qrCodeToken}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
            {qrCodeUrl && (
              <a
                href={qrCodeUrl}
                download={`${stakeholderData.name.replace(/\s+/g, '_')}_Badge.png`}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Save Badge</span>
              </a>
            )}

            <button
              onClick={handleSendNotification}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Email/SMS</span>
            </button>
          </div>

          {dispatchStatus && (
            <p className="text-xs font-semibold text-sky-600 pt-2">{dispatchStatus}</p>
          )}
        </div>
      )}
    </div>
  );
}