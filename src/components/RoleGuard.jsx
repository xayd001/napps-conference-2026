import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function RoleGuard({ allowedRoles, children }) {
  const { userRole } = useAuth();

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500">
          Your assigned role (<span className="font-bold text-slate-800">{userRole}</span>) does not have authorization to view this operational module.
        </p>
      </div>
    );
  }

  return children;
}