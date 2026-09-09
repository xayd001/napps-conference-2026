import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Building2, 
  HeartHandshake, 
  PackageCheck, 
  UserPlus, 
  Coins, 
  Wrench, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

export default function CSRLedgerAndRegistration() {
  const [activeTab, setActiveTab] = useState('csr'); // 'csr' or 'registration'
  const [contributions, setContributions] = useState([]);
  const [delegates, setDelegates] = useState([]);
  const [loading, setLoading] = useState(true);

  // CSR Form State
  const [csrForm, setCsrForm] = useState({
    partnerName: '',
    partnerType: 'NGO', // NGO, Development Partner, Corporate Sponsor
    category: 'Financial', // Financial, Material Logistics, Technical Support, CSR
    description: '',
    estimatedValue: '',
    contactPerson: '',
    email: '',
    status: 'Committed' // Committed, Received, In Progress
  });

  // Delegate Registration Form State
  const [delegateForm, setDelegateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    designation: '',
    delegateCategory: 'Standard Delegate', // VIP, Speaker, NGO Representative, Standard Delegate
    specialRequirements: ''
  });

  // Real-time Firestore Sync
  useEffect(() => {
    const unsubCSR = onSnapshot(collection(db, 'csr_ledger'), (snapshot) => {
      setContributions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubDelegates = onSnapshot(collection(db, 'registered_delegates'), (snapshot) => {
      setDelegates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubCSR();
      unsubDelegates();
    };
  }, []);

  // Handlers for CSR Ledger
  const handleCSRSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'csr_ledger'), {
        ...csrForm,
        estimatedValue: Number(csrForm.estimatedValue) || 0,
        createdAt: serverTimestamp()
      });
      setCsrForm({
        partnerName: '',
        partnerType: 'NGO',
        category: 'Financial',
        description: '',
        estimatedValue: '',
        contactPerson: '',
        email: '',
        status: 'Committed'
      });
      alert('Support contribution logged successfully!');
    } catch (error) {
      console.error('Error logging CSR entry:', error);
    }
  };

  const handleDeleteCSR = async (id) => {
    if (window.confirm('Delete this ledger item?')) {
      await deleteDoc(doc(db, 'csr_ledger', id));
    }
  };

  // Handlers for Delegate Registration
  const handleDelegateSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'registered_delegates'), {
        ...delegateForm,
        registeredAt: serverTimestamp()
      });
      setDelegateForm({
        fullName: '',
        email: '',
        phone: '',
        organization: '',
        designation: '',
        delegateCategory: 'Standard Delegate',
        specialRequirements: ''
      });
      alert('Delegate registered successfully!');
    } catch (error) {
      console.error('Error registering delegate:', error);
    }
  };

  const totalFinancialValue = contributions
    .filter(item => item.category === 'Financial')
    .reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 py-6">
      {/* Navigation Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-sky-600" />
            Support, CSR Ledger & Delegate Registration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track NGO commitments, partner logistics, and streamline custom delegate onboarding.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('csr')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'csr' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" /> Support & CSR Ledger
          </button>
          <button
            onClick={() => setActiveTab('registration')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'registration' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Delegate Registration
          </button>
        </div>
      </div>

      {/* TAB 1: CSR & SUPPORT LEDGER */}
      {activeTab === 'csr' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Financial Commitments</p>
                <p className="text-lg font-bold text-slate-800">₦{totalFinancialValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Logistics & Tech Support Items</p>
                <p className="text-lg font-bold text-slate-800">
                  {contributions.filter(c => c.category !== 'Financial').length} Contributions
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Active Partners & NGOs</p>
                <p className="text-lg font-bold text-slate-800">
                  {new Set(contributions.map(c => c.partnerName)).size} Organizations
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Record Form */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
                <Plus className="w-4 h-4 text-sky-600" /> Log Partner Support / CSR
              </h3>

              <form onSubmit={handleCSRSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization / Partner Name</label>
                  <input
                    type="text"
                    value={csrForm.partnerName}
                    onChange={(e) => setCsrForm({ ...csrForm, partnerName: e.target.value })}
                    placeholder="e.g. UNICEF / Zenith Bank"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Partner Type</label>
                    <select
                      value={csrForm.partnerType}
                      onChange={(e) => setCsrForm({ ...csrForm, partnerType: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="NGO">NGO</option>
                      <option value="Development Partner">Development Partner</option>
                      <option value="Corporate Sponsor">Corporate Sponsor</option>
                      <option value="Government Body">Government Body</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Support Category</label>
                    <select
                      value={csrForm.category}
                      onChange={(e) => setCsrForm({ ...csrForm, category: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Financial">Financial Grant</option>
                      <option value="Material Logistics">Material Logistics</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="CSR">CSR Contribution</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Value (NGN)</label>
                  <input
                    type="number"
                    value={csrForm.estimatedValue}
                    onChange={(e) => setCsrForm({ ...csrForm, estimatedValue: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description / Deliverables</label>
                  <textarea
                    rows="3"
                    value={csrForm.description}
                    onChange={(e) => setCsrForm({ ...csrForm, description: e.target.value })}
                    placeholder="e.g. Provision of 500 conference bags and PA system setup."
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={csrForm.contactPerson}
                      onChange={(e) => setCsrForm({ ...csrForm, contactPerson: e.target.value })}
                      placeholder="Name"
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={csrForm.status}
                      onChange={(e) => setCsrForm({ ...csrForm, status: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Committed">Committed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Received">Received / Fulfilled</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors"
                >
                  Save to Ledger
                </button>
              </form>
            </div>

            {/* Ledger List */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-3 flex items-center justify-between">
                <span>Active Ledger Entries</span>
                <span className="text-xs font-normal text-slate-500">{contributions.length} Records logged</span>
              </h3>

              {contributions.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No CSR or partner commitments recorded yet.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {contributions.map((item) => (
                    <div key={item.id} className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-all space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-xs">{item.partnerName}</h4>
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {item.partnerType}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.category === 'Financial' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCSR(item.id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>Contact: <strong>{item.contactPerson || 'N/A'}</strong></span>
                        {item.estimatedValue > 0 && (
                          <span>Valued at: <strong className="text-slate-800">₦{item.estimatedValue.toLocaleString()}</strong></span>
                        )}
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          item.status === 'Received' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM DELEGATE REGISTRATION */}
      {activeTab === 'registration' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
              <UserPlus className="w-4 h-4 text-sky-600" /> Register New Delegate
            </h3>

            <form onSubmit={handleDelegateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={delegateForm.fullName}
                  onChange={(e) => setDelegateForm({ ...delegateForm, fullName: e.target.value })}
                  placeholder="e.g. Dr. Amina Bello"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={delegateForm.email}
                    onChange={(e) => setDelegateForm({ ...delegateForm, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={delegateForm.phone}
                    onChange={(e) => setDelegateForm({ ...delegateForm, phone: e.target.value })}
                    placeholder="+234..."
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization / School</label>
                  <input
                    type="text"
                    value={delegateForm.organization}
                    onChange={(e) => setDelegateForm({ ...delegateForm, organization: e.target.value })}
                    placeholder="School Name"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={delegateForm.designation}
                    onChange={(e) => setDelegateForm({ ...delegateForm, designation: e.target.value })}
                    placeholder="e.g. Proprietor / Director"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delegate Category</label>
                <select
                  value={delegateForm.delegateCategory}
                  onChange={(e) => setDelegateForm({ ...delegateForm, delegateCategory: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="Standard Delegate">Standard Delegate</option>
                  <option value="VIP Delegate">VIP Delegate</option>
                  <option value="Guest Speaker">Guest Speaker</option>
                  <option value="NGO Representative">NGO Representative</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Requirements / Notes</label>
                <textarea
                  rows="2"
                  value={delegateForm.specialRequirements}
                  onChange={(e) => setDelegateForm({ ...delegateForm, specialRequirements: e.target.value })}
                  placeholder="Dietary requirements, accessibility assistance, etc."
                  className="w-full border border-slate-300 rounded-lg p-2"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors"
              >
                Complete Registration
              </button>
            </form>
          </div>

          {/* Registered Delegates List */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-3 flex items-center justify-between">
              <span>Registered Delegates</span>
              <span className="text-xs font-normal text-slate-500">{delegates.length} Delegates</span>
            </h3>

            {delegates.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No delegates registered yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {delegates.map((delegate) => (
                  <div key={delegate.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-xs">{delegate.fullName}</h4>
                        <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {delegate.delegateCategory}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {delegate.organization} — <em>{delegate.designation}</em>
                      </p>
                      <p className="text-[11px] text-slate-400">{delegate.email} | {delegate.phone}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}