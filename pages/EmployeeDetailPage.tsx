
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { generatePerformanceInsight } from '../services/AiService';
import { PerformanceEvaluation, LeaveType, LeaveRecord, Observation, ManagerNote } from '../types';

const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    employees, evaluations, notes, leaves, observations,
    addEvaluation, addLeave, addObservation, addNote 
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'evaluations' | 'work_issues' | 'leaves' | 'behaviour_issues'>('leaves');
  const [showForm, setShowForm] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const employee = employees.find(e => e.id === id);
  if (!employee) return <div className="p-20 text-center font-bold text-slate-400">Personnel record not found.</div>;

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdminOrManager = isAdmin || isManager;

  const empEvals = evaluations.filter(e => e.employeeId === id).sort((a, b) => b.year - a.year);
  const empWorkIssues = notes.filter(n => n.employeeId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const empAttendance = leaves.filter(l => l.employeeId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const empBehaviourIssues = observations.filter(o => o.employeeId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(false);
    const result = await generatePerformanceInsight({
      name: employee.name,
      role: employee.role,
      score: employee.overallScore,
      workIssues: empWorkIssues,
      attendance: empAttendance,
      behaviourIssues: empBehaviourIssues
    });
    if (result.startsWith("ERROR") || result.includes("failed")) {
      setAiError(true);
    }
    setAiInsight(result);
    setIsAiLoading(false);
  };

  const handleExportPDF = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const html = `
      <html>
        <head>
          <title>Personnel Summary - ${employee.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print { .no-print { display: none; } body { background: white; } }
            body { font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; }
            .pdf-card { break-inside: avoid; border-radius: 24px; padding: 24px; background: white; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <div class="max-w-4xl mx-auto">
            <div class="pdf-card bg-indigo-900 text-white border-none shadow-2xl flex justify-between items-center p-10">
              <div class="flex items-center space-x-8">
                ${employee.profilePicture ? 
                  `<img src="${employee.profilePicture}" class="w-32 h-32 rounded-3xl object-cover border-4 border-white/20" />` :
                  `<div class="w-32 h-32 rounded-3xl bg-white/10 text-white flex items-center justify-center text-5xl font-black border-4 border-white/20">${employee.name.charAt(0)}</div>`
                }
                <div>
                  <h1 class="text-4xl font-black tracking-tight">${employee.name}</h1>
                  <p class="text-indigo-300 font-bold uppercase tracking-[0.2em] text-xs mt-2">${employee.role}</p>
                  <p class="text-indigo-400 text-[10px] font-black uppercase mt-4 tracking-widest">${employee.department} • Since ${employee.hireDate}</p>
                </div>
              </div>
              <div class="text-center px-8 py-4 bg-white/5 rounded-3xl">
                <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Efficiency</p>
                <p class="text-5xl font-black">${employee.overallScore}%</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8">
              <div class="pdf-card">
                <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">Latest Evaluations</h2>
                ${empEvals.length === 0 ? '<p class="text-xs text-slate-400 italic">No evaluations recorded.</p>' : empEvals.map(ev => `
                  <div class="mb-6 last:mb-0">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-lg font-black text-indigo-600">${ev.year}</span>
                      <span class="text-[9px] font-black uppercase px-2 py-1 rounded bg-slate-50 border">${ev.rating}</span>
                    </div>
                    <p class="text-xs font-medium text-slate-600 leading-relaxed italic">"${ev.summary}"</p>
                  </div>
                `).join('')}
              </div>

              <div class="pdf-card">
                <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">Attendance Log</h2>
                <div class="space-y-3">
                  ${empAttendance.length === 0 ? '<p class="text-xs text-slate-400 italic">Perfect attendance recorded.</p>' : empAttendance.map(l => `
                    <div class="flex items-center justify-between text-[11px] p-3 bg-slate-50 rounded-xl">
                      <div class="flex items-center space-x-3">
                        <span class="w-2 h-2 rounded-full ${l.type === 'sick' ? 'bg-amber-400' : l.type === 'vacation' ? 'bg-emerald-400' : 'bg-red-500'}"></span>
                        <span class="font-black text-slate-800">${l.date}</span>
                      </div>
                      <span class="font-bold text-slate-500 capitalize">${l.type} (${l.duration}d)</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  const handleSaveEvaluation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addEvaluation({
      employeeId: id!,
      year: parseInt(fd.get('year') as string),
      date: new Date().toISOString().split('T')[0],
      score: parseInt(fd.get('score') as string),
      summary: fd.get('summary') as string,
      rating: fd.get('rating') as any,
    });
    setShowForm(null);
  };

  const handleSaveLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addLeave({
      employeeId: id!,
      date: fd.get('date') as string,
      type: fd.get('type') as LeaveType,
      duration: parseFloat(fd.get('duration') as string),
      comment: fd.get('comment') as string,
    });
    setShowForm(null);
  };

  const handleSaveBehaviourIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addObservation({
      employeeId: id!,
      date: fd.get('date') as string,
      description: fd.get('description') as string,
      status: fd.get('status') as 'open' | 'closed',
      actionPlan: fd.get('actionPlan') as string,
    });
    setShowForm(null);
  };

  const handleSaveWorkIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addNote({
      employeeId: id!,
      date: new Date().toISOString().split('T')[0],
      authorId: user!.id,
      authorName: user!.name,
      title: fd.get('title') as string,
      text: fd.get('text') as string,
    });
    setShowForm(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Info - Sticky on desktop */}
        <div className="w-full lg:w-96 shrink-0 space-y-6 lg:sticky lg:top-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 text-center">
            <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center text-4xl font-black mb-6 shadow-xl border-4 border-slate-50 mx-auto overflow-hidden">
              {employee.profilePicture ? <img src={employee.profilePicture} className="w-full h-full object-cover" alt={employee.name} /> : employee.name.charAt(0)}
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{employee.name}</h2>
            <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.25em] mt-2">{employee.role}</p>
            <div className="mt-8 grid grid-cols-1 gap-3 w-full">
              <button onClick={handleRunAiAnalysis} disabled={isAiLoading} className="flex items-center justify-center w-full px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50">
                {isAiLoading ? "Analyzing..." : "✨ AI Insights"}
              </button>
              <button onClick={handleExportPDF} className="w-full px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">
                Export Report
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current Efficiency</p>
            <h4 className="text-5xl font-black">{employee.overallScore}%</h4>
            <p className="text-[10px] text-slate-400 mt-2">Based on most recent performance review.</p>
          </div>

          {aiInsight && (
            <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden ${aiError ? 'bg-red-900' : 'bg-indigo-600'}`}>
               <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4">Analysis Results</h4>
               <p className="text-sm leading-relaxed text-indigo-50 font-medium whitespace-pre-wrap">{aiInsight}</p>
               <button onClick={() => setAiInsight(null)} className="mt-6 text-[9px] font-black text-indigo-200 uppercase hover:text-white transition-colors underline decoration-dotted">Dismiss</button>
            </div>
          )}
        </div>

        {/* Main Log Content */}
        <div className="flex-1 min-w-0 flex flex-col space-y-8">
           <div className="bg-white p-2 rounded-[2rem] shadow-xl flex gap-2 overflow-x-auto border border-slate-50 no-scrollbar sticky top-0 z-10">
             <button onClick={() => { setActiveTab('leaves'); setShowForm(null); }} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'leaves' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Attendance</button>
             {isAdminOrManager && (
               <>
                 <button onClick={() => { setActiveTab('evaluations'); setShowForm(null); }} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'evaluations' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Evaluations</button>
                 <button onClick={() => { setActiveTab('work_issues'); setShowForm(null); }} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'work_issues' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Work Issues</button>
                 <button onClick={() => { setActiveTab('behaviour_issues'); setShowForm(null); }} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'behaviour_issues' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Behaviour Issues</button>
               </>
             )}
           </div>

           <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-50">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('_', ' ')} Registry</h3>
               <button onClick={() => setShowForm(showForm === activeTab ? null : activeTab)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center shadow-lg active:scale-95">
                 {showForm === activeTab ? "Close Form" : `Add Entry`}
               </button>
             </div>

             {showForm === 'leaves' && (
               <form onSubmit={handleSaveLeave} className="mb-10 p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Date</label>
                     <input name="date" type="date" required className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Type</label>
                     <select name="type" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm">
                       <option value="vacation">Vacation</option>
                       <option value="sick">Sick Leave</option>
                       <option value="absence">Unexcused Absence</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Duration (Days)</label>
                     <input name="duration" type="number" step="0.5" required min="0.5" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" placeholder="1.0" />
                   </div>
                 </div>
                 <button type="submit" className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Submit Entry</button>
               </form>
             )}

             {showForm === 'evaluations' && (
               <form onSubmit={handleSaveEvaluation} className="mb-10 p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Year</label>
                     <input name="year" type="number" required defaultValue={new Date().getFullYear()} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Rating</label>
                     <select name="rating" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm">
                       <option value="Meets">Meets Standards</option>
                       <option value="Exceeds">Exceeds Standards</option>
                       <option value="Below">Below Standards</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Score (0-100)</label>
                     <input name="score" type="number" required min="0" max="100" defaultValue="80" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" />
                   </div>
                   <div className="md:col-span-full space-y-1.5">
                     <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Summary</label>
                     <textarea name="summary" required rows={3} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" placeholder="Details..."></textarea>
                   </div>
                 </div>
                 <button type="submit" className="mt-8 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">Save Evaluation</button>
               </form>
             )}

             {showForm === 'work_issues' && (
               <form onSubmit={handleSaveWorkIssue} className="mb-10 p-8 bg-slate-900 text-white rounded-[2rem]">
                 <div className="space-y-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Title</label>
                     <input name="title" required className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-bold text-white outline-none" placeholder="Issue title" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Description</label>
                     <textarea name="text" required rows={3} className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-bold text-white outline-none" placeholder="Details..."></textarea>
                   </div>
                 </div>
                 <button type="submit" className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-500 transition-all">Record Issue</button>
               </form>
             )}

             {showForm === 'behaviour_issues' && (
               <form onSubmit={handleSaveBehaviourIssue} className="mb-10 p-8 bg-amber-50 rounded-[2rem] border border-amber-200">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Date</label>
                     <input name="date" type="date" required className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Status</label>
                     <select name="status" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm">
                       <option value="open">Open</option>
                       <option value="closed">Closed</option>
                     </select>
                   </div>
                   <div className="md:col-span-full space-y-1.5">
                     <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Description</label>
                     <textarea name="description" required rows={3} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" placeholder="Details..."></textarea>
                   </div>
                   <div className="md:col-span-full space-y-1.5">
                     <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Action Plan</label>
                     <input name="actionPlan" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" placeholder="Resolution steps..." />
                   </div>
                 </div>
                 <button type="submit" className="mt-8 w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-amber-700 transition-all">Log Issue</button>
               </form>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {activeTab === 'leaves' && (
                 empAttendance.length === 0 ? <p className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Attendance Incidents</p> : 
                 empAttendance.map(l => (
                   <div key={l.id} className="p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center space-x-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                       l.type === 'vacation' ? 'bg-emerald-100 text-emerald-600' :
                       l.type === 'sick' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                     }`}>
                       {l.type.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="text-lg font-black text-slate-800 tracking-tight">{l.date}</p>
                       <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{l.type} • {l.duration} Days</p>
                     </div>
                   </div>
                 ))
               )}

               {activeTab === 'evaluations' && (
                 empEvals.length === 0 ? <p className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Evaluations Recorded</p> : 
                 empEvals.map(ev => (
                   <div key={ev.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl transition-all relative">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <p className="text-2xl font-black text-slate-900 tracking-tight">{ev.score}%</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{ev.year} Review</p>
                       </div>
                       <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         ev.rating === 'Exceeds' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         ev.rating === 'Meets' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-red-50 text-red-600 border-red-100'
                       }`}>{ev.rating}</span>
                     </div>
                     <p className="text-slate-600 font-medium italic text-xs leading-relaxed">"${ev.summary}"</p>
                   </div>
                 ))
               )}

               {activeTab === 'work_issues' && (
                 empWorkIssues.length === 0 ? <p className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Work Issues Recorded</p> : 
                 empWorkIssues.map(note => (
                   <div key={note.id} className="p-8 border border-slate-100 bg-slate-900 text-white rounded-[2.5rem] hover:shadow-xl transition-all mb-4">
                     <div className="flex justify-between items-start mb-4">
                       <h5 className="text-lg font-black tracking-tight text-indigo-400 uppercase">{note.title}</h5>
                       <span className="text-[9px] font-black opacity-40">{note.date}</span>
                     </div>
                     <p className="text-slate-300 text-xs leading-relaxed">{note.text}</p>
                   </div>
                 ))
               )}

               {activeTab === 'behaviour_issues' && (
                 empBehaviourIssues.length === 0 ? <p className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Behaviour Issues Recorded</p> : 
                 empBehaviourIssues.map(o => (
                   <div key={o.id} className="p-8 border-l-8 border-l-amber-400 border border-slate-100 rounded-[2.5rem] bg-white hover:shadow-2xl transition-all mb-4">
                     <div className="flex justify-between items-center mb-4">
                       <span className="text-lg font-black text-slate-800 tracking-tight">{o.date}</span>
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${o.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{o.status}</span>
                     </div>
                     <p className="text-slate-600 font-medium text-xs mb-4 leading-relaxed">{o.description}</p>
                     {o.actionPlan && <div className="p-4 bg-amber-50 rounded-xl text-[9px] text-amber-800 font-bold">Plan: {o.actionPlan}</div>}
                   </div>
                 ))
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
