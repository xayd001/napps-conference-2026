import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { subscribeToStakeholders } from '../services/stakeholderService';
import { requestNotificationPermission } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/roles';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Radio, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  BellRing, 
  Loader2, 
  Mic 
} from 'lucide-react';

export default function ProgramAgenda() {
  const { userRole } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Day 1');
  const [broadcastAlert, setBroadcastAlert] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    day: 'Day 1',
    time: '09:00 AM - 10:30 AM',
    location: 'Main Auditorium',
    type: 'Keynote',
    speaker: '',
    assignedSpeakerId: '',
    status: 'Scheduled',
    broadcastNote: ''
  });

  // Check management privileges
  const canManageSchedule = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PROTOCOL].includes(userRole);

  // Subscribe to Real-Time Sessions & Stakeholders
  useEffect(() => {
    const unsubscribeSessions = onSnapshot(
      collection(db, 'program_sessions'),
      (snapshot) => {
        const sessionList = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const updatedData = change.doc.data();
            setBroadcastAlert({
              title: updatedData.title,
              location: updatedData.location,
              time: updatedData.time,
              note: updatedData.broadcastNote || 'Schedule updated in real-time.'
            });
            setTimeout(() => setBroadcastAlert(null), 8000);
          }
        });

        snapshot.forEach((docSnap) => {
          sessionList.push({ id: docSnap.id, ...docSnap.data() });
        });

        setSessions(sessionList);
        setLoading(false);
      },
      (error) => {
        console.error('Real-time listener error:', error);
        setLoading(false);
      }
    );

    const unsubscribeStakeholders = subscribeToStakeholders(setStakeholders);

    return () => {
      unsubscribeSessions();
      unsubscribeStakeholders();
    };
  }, []);

  const handleOpenModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        title: session.title || '',
        day: session.day || selectedDay,
        time: session.time || '09:00 AM - 10:30 AM',
        location: session.location || session.venueHall || 'Main Auditorium',
        type: session.type || 'Keynote',
        speaker: session.speaker || '',
        assignedSpeakerId: session.assignedSpeakerId || '',
        status: session.status || 'Scheduled',
        broadcastNote: ''
      });
    } else {
      setEditingSession(null);
      setFormData({
        title: '',
        day: selectedDay,
        time: '09:00 AM - 10:30 AM',
        location: 'Main Auditorium',
        type: 'Keynote',
        speaker: '',
        assignedSpeakerId: '',
        status: 'Scheduled',
        broadcastNote: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingSession) {
        const docRef = doc(db, 'program_sessions', editingSession.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'program_sessions'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save schedule update.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this session?')) {
      try {
        await deleteDoc(doc(db, 'program_sessions', id));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const filteredSessions = sessions.filter((s) => (s.day || 'Day 1') === selectedDay);

  const getSpeakerName = (speakerId, rawSpeaker) => {
    if (speakerId) {
      const stakeholder = stakeholders.find((st) => st.id === speakerId);
      if (stakeholder) return `${stakeholder.name} (${stakeholder.organization || 'VIP'})`;
    }
    return rawSpeaker || 'No Speaker Assigned';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Broadcast Alert Banner */}
      {broadcastAlert && (
        <div className="bg-amber-500 text-white p-4 rounded-xl shadow-lg flex items-start justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase bg-white text-amber-600 px-2 py-0.5 rounded">
                  Live Update Broadcast
                </span>
                <span className="font-semibold text-sm">{broadcastAlert.title}</span>
              </div>
              <p className="text-xs text-amber-100 mt-1">
                {broadcastAlert.note} — Time: <strong>{broadcastAlert.time}</strong> | Venue: <strong>{broadcastAlert.location}</strong>
              </p>
            </div>
          </div>
          <button onClick={() => setBroadcastAlert(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-800">Program Agenda & Live Schedule</h2>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-500" /> Real-time Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Instantly updated room shifts, speaker announcements, and program timelines.
          </p>
        </div>

        {canManageSchedule && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Program Session
          </button>
        )}
      </div>

      {/* Push Notification Opt-in Prompt */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-800">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-sky-600 animate-bounce flex-shrink-0" />
          <span>Want instant push alerts on venue changes and speaker updates?</span>
        </div>
        <button 
          onClick={requestNotificationPermission}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors self-end sm:self-auto"
        >
          Enable Push Notifications
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex border-b border-slate-200 space-x-4">
        {['Day 1', 'Day 2', 'Day 3'].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`pb-2 px-3 text-xs font-bold transition-colors border-b-2 ${
              selectedDay === day
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {day} Schedule
          </button>
        ))}
      </div>

      {/* Session List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs">Connecting to live schedule stream...</span>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-xs">
          No program sessions published for {selectedDay} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white rounded-xl border p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                session.status === 'In Progress'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                  : session.status === 'Shifted'
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    session.status === 'In Progress'
                      ? 'bg-emerald-100 text-emerald-800'
                      : session.status === 'Shifted'
                      ? 'bg-amber-100 text-amber-800'
                      : session.status === 'Completed'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-sky-100 text-sky-800'
                  }`}>
                    {session.status || 'Scheduled'}
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                    {session.type || 'Keynote'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">{session.title}</h3>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <strong>{session.time}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {session.location || session.venueHall}
                  </span>
                </div>

                {(session.assignedSpeakerId || session.speaker) && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md w-fit">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Speaker: {getSpeakerName(session.assignedSpeakerId, session.speaker)}</span>
                  </div>
                )}
              </div>

              {canManageSchedule && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenModal(session)}
                    className="p-2 text-slate-600 hover:text-sky-600 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="p-2 text-slate-600 hover:text-red-600 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingSession ? 'Edit & Broadcast Schedule Shift' : 'Add New Program Session'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Conference Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                  >
                    <option value="Day 1">Day 1</option>
                    <option value="Day 2">Day 2</option>
                    <option value="Day 3">Day 3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                  >
                    <option value="Keynote">Keynote</option>
                    <option value="Panel Discussion">Panel Discussion</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Break / Networking">Break / Networking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={formData.time}
                    placeholder="e.g. 09:00 AM - 10:30 AM"
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Shifted">Shifted / Delayed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hall / Venue Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    placeholder="e.g. Main Auditorium"
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign VIP Speaker</label>
                  <select
                    value={formData.assignedSpeakerId}
                    onChange={(e) => setFormData({ ...formData, assignedSpeakerId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                  >
                    <option value="">-- Select Registered VIP --</option>
                    {stakeholders.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.organization || 'VIP'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Live Broadcast Alert Note</label>
                <input
                  type="text"
                  value={formData.broadcastNote}
                  placeholder="e.g. Session delayed by 15 mins due to key arrivals."
                  onChange={(e) => setFormData({ ...formData, broadcastNote: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                >
                  Save & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}