
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { departments, addDepartment, deleteDepartment, updateDepartment } = useData();
  const { user } = useAuth();
  const [newDept, setNewDept] = useState('');
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (user?.role !== 'admin') return <div className="p-8 text-center text-red-600 font-black uppercase tracking-widest">Unauthorized Access Denied.</div>;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDept.trim()) {
      if (departments.includes(newDept.trim())) {
        setFeedback({ message: 'Department already exists in the registry.', type: 'error' });
      } else {
        addDepartment(newDept.trim());
        setNewDept('');
        setFeedback({ message: 'Department successfully authorized.', type: 'success' });
      }
    }
  };

  const handleStartEdit = (dept: string) => {
    setEditingDept(dept);
    setEditValue(dept);
  };

  const handleUpdate = () => {
    if (editingDept && editValue.trim()) {
      if (editValue.trim() !== editingDept && departments.includes(editValue.trim())) {
        setFeedback({ message: 'Namespace collision: Name already in use.', type: 'error' });
      } else {
        updateDepartment(editingDept, editValue.trim());
        setFeedback({ message: 'Department record updated.', type: 'success' });
        setEditingDept(null);
      }
    } else {
      setEditingDept(null);
    }
  };

  const handleDelete = (dept: string) => {
    if (window.confirm(`Are you certain you wish to purge the following department from the organizational structure: ${dept}?`)) {
      deleteDepartment(dept);
      setFeedback({ message: 'Department removed from registry.', type: 'success' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-slate-200">
        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">System Authority</h2>
        <p className="text-slate-500 text-sm mb-10 font-medium">Manage top-level organizational parameters and operational departments.</p>

        {feedback && (
          <div className={`mb-8 p-4 rounded-2xl border-2 flex items-center animate-in slide-in-from-top-4 duration-300 ${
            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${feedback.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {feedback.type === 'success' ? '✓' : '⚠'}
            </div>
            <span className="text-xs font-black uppercase tracking-widest">{feedback.message}</span>
          </div>
        )}

        <div className="space-y-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Departmental Infrastructure</h3>
          </div>
          
          <form onSubmit={handleAdd} className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input 
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              placeholder="Assign new department name..."
              className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
            />
            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Register</button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl group hover:border-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                {editingDept === dept ? (
                  <div className="flex flex-1 gap-2 animate-in zoom-in-95 duration-200">
                    <input 
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm font-bold border-b-2 border-indigo-600 outline-none bg-indigo-50/50 rounded-t-lg"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                    />
                    <button onClick={handleUpdate} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700">Save</button>
                    <button onClick={() => setEditingDept(null)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-300">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {dept.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-slate-700 tracking-tight">{dept}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                      <button 
                        onClick={() => handleStartEdit(dept)} 
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 border border-indigo-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(dept)} 
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        title="Delete Department"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-8 flex items-center">
          <span className="w-8 h-0.5 bg-indigo-400 mr-4"></span>
          System Integrity Report
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1 group-hover:text-white">Active Infrastructure</p>
            <p className="text-3xl font-black text-white">{departments.length} <span className="text-xs font-bold opacity-40">Depts</span></p>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1 group-hover:text-white">Build Release</p>
            <p className="text-3xl font-black text-white">v3.2.4 <span className="text-xs font-bold opacity-40">Stable</span></p>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Authorization</p>
            <p className="text-3xl font-black text-emerald-400 uppercase tracking-tighter">Full Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
