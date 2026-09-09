import React, { useState } from 'react';
import { seedDatabaseSchema } from '../services/schemaService';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setMessage('');
    try {
      await seedDatabaseSchema();
      setMessage('Database seeded successfully!');
    } catch (err) {
      setMessage('Failed to seed database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Database Schema Initializer</h3>
          <p className="text-[10px] text-slate-500">Seed default collections (`stakeholders`, `protocol_logs`, `program_sessions`, `sponsorships`)</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          <span>{loading ? 'Seeding...' : 'Seed Database'}</span>
        </button>
      </div>
      {message && (
        <p className={`text-[10px] font-bold ${message.includes('successfully') ? 'text-emerald-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}