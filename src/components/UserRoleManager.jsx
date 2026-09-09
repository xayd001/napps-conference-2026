import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { ROLES } from '../config/roles';
import { ShieldCheck, UserCheck, Search, Loader2, UserPlus } from 'lucide-react';

export default function UserRoleManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUid, setUpdatingUid] = useState(null);

  // New user registration state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState(ROLES.LIAISON);
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      querySnapshot.forEach((docSnap) => {
        userList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Admin registers new user without signing out current admin session
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return alert('Please enter email and password.');

    setCreatingUser(true);
    try {
      // Secondary auth instance to create accounts without logging out current Super Admin
      const secondaryApp = getApps().length > 1 
        ? getApps()[1] 
        : initializeApp(auth.app.options, 'SecondaryAuth');
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const newUser = userCredential.user;

      // Save user profile & role to Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newEmail,
        role: newRole,
        createdAt: new Date().toISOString()
      });

      alert(`Account created successfully for ${newEmail}`);
      setNewEmail('');
      setNewPassword('');
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleRoleChange = async (userId, updatedRole) => {
    setUpdatingUid(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { role: updatedRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updatedRole } : u))
      );
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* SECTION 1: ADMIN REGISTRATION FORM */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-800">Register New Committee Member</h3>
        </div>

        <form onSubmit={handleRegisterUser} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="email"
            placeholder="Member Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Initial Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
          >
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={creatingUser}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg p-2.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>
      </div>

      {/* SECTION 2: USER REGISTRY TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-sky-600" />
              <h2 className="text-lg font-bold text-slate-800">Registered Accounts</h2>
            </div>
            <p className="text-xs text-slate-500">Super Admin Control Panel</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Loading accounts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="p-3">User Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Reassign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      <span>{user.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-50 text-sky-700 border border-sky-200">
                        {user.role || ROLES.GUEST}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={user.role || ROLES.GUEST}
                        disabled={updatingUid === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 outline-none"
                      >
                        {Object.values(ROLES).map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}