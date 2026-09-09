import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Header() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="bg-napps-dark text-white border-b-4 border-napps-blue px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/napps-logo.png" alt="NAPPS Logo" className="w-10 h-10 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight">NAPPSCONFERENCE2026</h1>
            <p className="text-[10px] text-napps-sky tracking-wider uppercase">Maiduguri, Borno State</p>
          </div>
        </div>

        <div>
          {isInstalled ? (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>App Ready Offline</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className="flex items-center gap-1.5 bg-napps-blue hover:bg-sky-600 disabled:opacity-40 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install NAPPS App</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}