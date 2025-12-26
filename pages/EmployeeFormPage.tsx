
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Employee, UserRole } from '../types';

const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, departments, addEmployee, updateEmployee } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEdit = !!id;
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    department: departments[0] || '',
    role: '',
    email: '',
    password: 'password', // Default password for new records
    hireDate: new Date().toISOString().split('T')[0],
    username: '',
    active: true,
    overallScore: 80,
    profilePicture: ''
  });

  const [accessLevel, setAccessLevel] = useState<UserRole>('employee');

  useEffect(() => {
    if (isEdit) {
      const existing = employees.find(e => e.id === id);
      if (existing) {
        setFormData(existing);
        setAccessLevel(existing.role as UserRole || 'employee');
      }
    }
  }, [id, employees, isEdit, departments]);

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <p className="text-slate-600 font-bold uppercase tracking-widest text-sm text-center">Unauthorized Access Denied</p>
      <button onClick={() => navigate('/employees')} className="text-indigo-600 font-black uppercase text-xs hover:underline">Return to list</button>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role: accessLevel };
      if (isEdit) {
        await updateEmployee(payload as Employee);
      } else {
        await addEmployee(payload as Omit<Employee, 'id'>);
      }
      navigate('/employees');
    } catch (err) {
      alert("Failed to save personnel record. Check console for details.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="h-4 bg-indigo-600 w-full"></div>
        <div className="p-10 lg:p-16">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {isEdit ? 'Refine Personnel' : 'Onboard New'} <br /> 
                <span className="text-indigo-600">Personnel Record</span>
              </h2>
            </div>
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center text-slate-200 overflow-hidden transition-all duration-500 group-hover:scale-105">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                )}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-indigo-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="md:col-span-full border-b border-slate-100 pb-2">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Fundamental Identification</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-100 transition-all text-sm font-bold placeholder:text-slate-300" placeholder="e.g. Johnathan Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Division</label>
                <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-100 transition-all text-sm font-bold">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Designation</label>
                <input type="text" required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-100 transition-all text-sm font-bold placeholder:text-slate-300" placeholder="e.g. Flight Support Specialist" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Communications</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-100 transition-all text-sm font-bold placeholder:text-slate-300" placeholder="name@company.com" />
              </div>
              <div className="md:col-span-full border-b border-slate-100 pb-2 mt-4">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Access Control & Security</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Username</label>
                <input type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-100 transition-all text-sm font-bold placeholder:text-slate-300" placeholder="jdoe_88" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key (Password)</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-100 transition-all text-sm font-bold" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Access Level</label>
                <select 
                  value={accessLevel} 
                  onChange={e => setAccessLevel(e.target.value as UserRole)} 
                  className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-100 transition-all text-sm font-bold"
                >
                  <option value="employee">Employee (Restricted)</option>
                  <option value="manager">Manager (Mid-Level)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input type="checkbox" id="active" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="peer w-8 h-8 rounded-xl border-2 border-indigo-200 text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer appearance-none bg-white checked:bg-indigo-600 checked:border-indigo-600" />
                  <svg className="w-5 h-5 absolute top-1.5 left-1.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <label htmlFor="active" className="text-sm font-black text-slate-800 uppercase tracking-tight cursor-pointer">Active Personnel State</label>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enables access and data logging</p>
                </div>
              </div>
            </div>
            <div className="pt-10 flex flex-col md:flex-row gap-6 items-center">
              <button type="submit" className="w-full md:w-auto md:flex-1 bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 hover:translate-y-[-4px] transition-all active:scale-95 uppercase tracking-[0.2em] text-sm">
                {isEdit ? 'Update Record' : 'Initialize Onboarding'}
              </button>
              <button type="button" onClick={() => navigate('/employees')} className="w-full md:w-64 py-5 text-slate-400 font-black hover:bg-slate-50 rounded-[2rem] transition-all uppercase tracking-[0.2em] text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFormPage;
