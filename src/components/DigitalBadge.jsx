import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function DigitalBadge({ guest, onBack }) {
  if (!guest) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800"
        >
          <Printer className="w-4 h-4" /> Print / Save Badge
        </button>
      </div>

      {/* Badge Frame */}
      <div className="bg-white border-4 border-slate-900 rounded-2xl p-6 shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="bg-slate-900 text-white py-2 -mx-6 -mt-6 mb-4">
          <h2 className="text-xs font-black tracking-widest uppercase">NAPPSCONFERENCE2026</h2>
          <p className="text-[9px] text-sky-400">OFFICIAL DELEGATE PASS</p>
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">{guest.name}</h3>
          <p className="text-xs font-semibold text-slate-600">{guest.organization}</p>
          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-300">
            {guest.category}
          </span>
        </div>

        {/* QR Code */}
        <div className="flex justify-center py-2">
          <div className="p-3 bg-white border-2 border-slate-200 rounded-xl shadow-inner">
            <QRCodeSVG value={guest.qrCodeToken} size={150} level="H" />
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono tracking-wider">
          TOKEN: {guest.qrCodeToken}
        </div>

        <div className="border-t border-slate-200 pt-3 text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
          Present at Gate for Verification
        </div>
      </div>
    </div>
  );
}