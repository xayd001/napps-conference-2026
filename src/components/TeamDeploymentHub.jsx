import React, { useState, useEffect } from 'react';
import { subscribeToTasks, addTask, updateTask, deleteTask } from '../services/taskService';
import { ClipboardList, Plus, CheckCircle, Clock, AlertCircle, Trash2, Edit2, ShieldAlert } from 'lucide-react';

const SUB_TEAMS = [
  'Government Liaison',
  'Traditional Institutions',
  'NGOs & Partners',
  'VIP Protocol',
  'Communication'
];

export default function TeamDeploymentHub() {
  const [tasks, setTasks] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    assignedTeam: 'Government Liaison',
    assigneeName: '',
    priority: 'Medium', // 'Low' | 'Medium' | 'High' | 'Urgent'
    status: 'Pending', // 'Pending' | 'In Progress' | 'Completed'
    dueDate: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeToTasks(setTasks);
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateTask(editingId, formData);
    } else {
      await addTask(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      assignedTeam: 'Government Liaison',
      assigneeName: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: ''
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      assignedTeam: item.assignedTeam,
      assigneeName: item.assigneeName || '',
      priority: item.priority,
      status: item.status,
      dueDate: item.dueDate || ''
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const filteredTasks = selectedTeam === 'All' 
    ? tasks 
    : tasks.filter(t => t.assignedTeam === selectedTeam);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-600" />
            Operational Committee Deployment Hub
          </h2>
          <p className="text-xs text-slate-500">Dispatch, assign, and track tasks across the 5 conference sub-teams</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch Task</span>
        </button>
      </div>

      {/* Sub-Team Selector Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedTeam('All')}
          className={`py-2 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
            selectedTeam === 'All' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Teams ({tasks.length})
        </button>
        {SUB_TEAMS.map((team) => {
          const count = tasks.filter(t => t.assignedTeam === team).length;
          return (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              className={`py-2 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                selectedTeam === team ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {team} ({count})
            </button>
          );
        })}
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            No active operational tasks assigned for this team filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {task.assignedTeam}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                    task.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                    task.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                {task.assigneeName && (
                  <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Assignee:</span> {task.assigneeName}</p>
                )}
                {task.dueDate && (
                  <p className="text-[10px] text-slate-400">Due: {task.dueDate}</p>
                )}
              </div>

              {/* Status Selector & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value })}
                  className={`text-[10px] font-bold rounded px-2 py-1 focus:outline-none ${
                    task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    task.status === 'In Progress' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <div className="flex gap-1">
                  <button onClick={() => handleEdit(task)} className="p-1 text-slate-500 hover:text-sky-600">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-500 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Operational Task' : 'Dispatch Operational Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Task Title / Brief</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Secure airport reception permit for Shehu of Borno delegation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Sub-Team</label>
                  <select
                    value={formData.assignedTeam}
                    onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {SUB_TEAMS.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Officer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Ibrahim K."
                    value={formData.assigneeName}
                    onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  {editingId ? 'Update Task' : 'Dispatch Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}