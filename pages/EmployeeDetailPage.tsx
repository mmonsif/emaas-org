
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

  // Data filtering
  const empEvals = evaluations.filter(e => e.employeeId === id).sort((a, b) => b.year - a.year);
  const empWorkIssues = notes.filter(n => n.employeeId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const empAttendance = leaves.filter(l => l.employeeId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const empBehaviourIssues = observations.filter(o => o.employeeId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ytdLeaves = empAttendance.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + curr.duration;
    return acc;
  }, {} as Record<string, number>);

  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(false);
    const context = {
      name: employee.name,
      role: employee.role,
      score: employee.overallScore,
      workIssues: empWorkIssues,
      attendance: empAttendance,
      behaviourIssues: empBehaviourIssues
    };
    
    const result = await generatePerformanceInsight(context);
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
          <title>SkyPort Executive Summary - ${employee.name}</title>
          <link href="https://cdn.tailwindcss.com" rel="stylesheet">
          <style>
            @media print {
              .no-print { display: none; }
              body { padding: 0; margin: 0; background: #f8fafc; -webkit-print-color-adjust: exact; }
              .card { break-inside: avoid; }
            }
            body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
          </style>
        </head>
        <body class="p-8 text-slate-800">
          <div class="bg-indigo-700 text-white rounded-[2rem] p-10 mb-8 flex justify-between items-center shadow-2xl">
            <div class="flex items-center space-x-8">
              ${employee.profilePicture ? 
                `<img src="${employee.profilePicture}" class="w-32 h-32 rounded-3xl object-cover border-4 border-white/20 shadow-xl" />` :
                `<div class="w-32 h-32 rounded-3xl bg-white/10 text-white flex items-center justify-center text-5xl font-black border-4 border-white/20 shadow-xl">${employee.name.charAt(0)}</div>`
              }
              <div>
                <h1 class="text-4xl font-black tracking-tight">${employee.name}</h1>
                <p class="text-indigo-200 font-bold uppercase tracking-widest text-sm mt-1">${employee.role}</p>
                <p class="text-indigo-300 text-[10px] font-black uppercase mt-3 tracking-widest">Division: ${employee.department} • Member Since ${employee.hireDate}</p>
              </div>
            </div>
            <div class="text-center bg-white/10 p-6 rounded-3xl border border-white/10">
              <p class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Performance Index</p>
              <p class="text-5xl font-black">${employee.overallScore}%</p>
            </div>
          </div>

          <div class="mb-10">
            <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Latest Evaluations</h2>
            <div class="grid grid-cols-2 gap-6">
              ${empEvals.map(ev => `
                <div class="card bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div class="flex justify-between items-start mb-4">
                    <span class="text-2xl font-black text-indigo-600">${ev.year}</span>
                    <span class="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      ev.rating === 'Exceeds' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      ev.rating === 'Meets' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }">${ev.rating}</span>
                  </div>
                  <p class="text-sm text-slate-600 font-medium leading-relaxed italic mb-4">"${ev.summary}"</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Review Date: ${ev.date}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mb-10">
            <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Attendance Registry</h2>
            <div class="grid grid-cols-3 gap-4">
              ${empAttendance.map(l => `
                <div class="card bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                    l.type === 'vacation' ? 'bg-emerald-50 text-emerald-600' :
                    l.type === 'sick' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  }">${l.type.charAt(0).toUpperCase()}</div>
                  <div>
                    <p class="text-sm font-black text-slate-900">${l.date}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">${l.type} • ${l.duration} Days</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-10">
            <div>
              <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Work Issues</h2>
              <div class="space-y-4">
                ${empWorkIssues.map(n => `
                  <div class="card bg-slate-900 text-white p-6 rounded-[2rem] border border-slate-800">
                    <div class="flex justify-between items-center mb-2">
                      <p class="font-black text-xs uppercase tracking-widest text-indigo-400">${n.title}</p>
                      <p class="text-[10px] opacity-40">${n.date}</p>
                    </div>
                    <p class="text-xs leading-relaxed opacity-80">${n.text}</p>
                    <p class="text-[8px] font-bold uppercase tracking-widest mt-4 opacity-40">Auth: ${n.authorName}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            <div>
              <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-4">Behaviour Issues</h2>
              <div class="space-y-4">
                ${empBehaviourIssues.map(o => `
                  <div class="card bg-white p-6 rounded-[2rem] border-l-8 border-amber-400 shadow-sm">
                    <div class="flex justify-between items-center mb-2">
                      <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest">${o.date}</p>
                      <span class="text-[8px] font-black uppercase px-2 py-1 bg-slate-100 rounded-lg">${o.status}</span>
                    </div>
                    <p class="text-xs font-medium text-slate-700 leading-relaxed mb-3">${o.description}</p>
                    ${o.actionPlan ? `<div class="bg-amber-50 p-3 rounded-xl text-[9px] font-bold text-amber-800 border border-amber-100">Plan: ${o.actionPlan}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="fixed bottom-12 right-12 no-print">
            <button onclick="window.print()" class="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl hover:scale-105 transition-all">
              <span>Print Executive Summary</span>
            </button>
          </div>
        </body>
      </html>
    `;
    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  const handleSaveEvaluation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addEvaluation({
      id: Math.random().toString(36).substr(2, 9),
      employeeId: id!,
      year: parseInt(fd.get('year') as string),
      date: new Date().toISOString().split('T')[0],
      score: parseInt(fd.get('score') as string),
      summary: fd.get('summary') as string,
      rating: fd.get('rating') as any,
    });
    setShowForm(null);
  };

  const handleSaveLeave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addLeave({
      id: Math.random().toString(36).substr(2, 9),
      employeeId: id!,
      date: fd.get('date') as string,
      type: fd.get('type') as LeaveType,
      duration: parseFloat(fd.get('duration') as string),
      comment: fd.get('comment') as string,
    });
    setShowForm(null);
  };

  const handleSaveBehaviourIssue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addObservation({
      id: Math.random().toString(36).substr(2, 9),
      employeeId: id!,
      date: fd.get('date') as string,
      description: fd.get('description') as string,
      status: fd.get('status') as 'open' | 'closed',
      actionPlan: fd.get('actionPlan') as string,
    });
    setShowForm(null);
  };

  const handleSaveWorkIssue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addNote({
      id: Math.random().toString(36).substr(2, 9),
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Profile Sidebar */}
        <div className="w-full lg:w-96 shrink-0 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 relative">
            <div className="relative flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center text-4xl font-black mb-6 shadow-xl border-4 border-slate-50 overflow-hidden">
                {employee.profilePicture ? <img src={employee.profilePicture} className="w-full h-full object-cover" /> : employee.name.charAt(0)}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{employee.name}</h2>
              <p className="text-indigo-600 text-xs font-black uppercase tracking-[0.25em] mt-2">{employee.role}</p>
              
              <div className="mt-8 grid grid-cols-1 gap-3 w-full">
                <button 
                  onClick={handleRunAiAnalysis}
                  disabled={isAiLoading}
                  className="flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  {isAiLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div> : <span className="mr-2">✨</span>}
                  {isAiLoading ? "Processing..." : "Generate AI Insights"}
                </button>
                <button onClick={handleExportPDF} className="w-full px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-colors">
                  Export Performance Report
                </button>
              </div>
            </div>
          </div>

          {aiInsight && (
            <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden ${aiError ? 'bg-red-900' : 'bg-slate-900'}`}>
               <div className="absolute top-0 right-0 p-4 opacity-20">{aiError ? '⚠️' : '✨'}</div>
               <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">{aiError ? 'System Error' : 'AI Talent Intelligence'}</h4>
               <p className="text-sm leading-relaxed text-indigo-50 font-medium whitespace-pre-wrap">{aiInsight}</p>
               <button onClick={() => { setAiInsight(null); setAiError(false); }} className="mt-6 text-[9px] font-black text-indigo-300 uppercase hover:text-white transition-colors underline decoration-dotted">Dismiss Analysis</button>
            </div>
          )}

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Overall Efficiency</p>
            <h4 className="text-5xl font-black">{employee.overallScore}%</h4>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 min-w-0 flex flex-col space-y-8">
           <div className="bg-white p-2 rounded-[2rem] shadow-xl flex gap-2 overflow-x-auto border border-slate-50 no-scrollbar">
             <button onClick={() => { setActiveTab('leaves'); setShowForm(null); }} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'leaves' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Attendance</button>
             {isAdminOrManager && (
               <>
                 <button onClick={() => { setActiveTab('evaluations'); setShowForm(null); }} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'evaluations' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Evaluations</button>
                 <button onClick={() => { setActiveTab('work_issues'); setShowForm(null); }} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'work_issues' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Work Issues</button>
                 <button onClick={() => { setActiveTab('behaviour_issues'); setShowForm(null); }} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'behaviour_issues' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Behaviour Issues</button>
               </>
             )}
           </div>

           <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-50 min-h-[500px]">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
               <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab.replace('_', ' ')} Record</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Personnel Management System • Terminal A</p>
               </div>
               
               <button 
                 onClick={() => setShowForm(showForm === activeTab ? null : activeTab)}
                 className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center shadow-lg active:scale-95"
               >
                 {showForm === activeTab ? "Dismiss Form" : `Log ${activeTab.split('_')[0]}`}
               </button>
             </div>

             {/* Forms */}
             {showForm === 'leaves' && (
               <form onSubmit={handleSaveLeave} className="mb-10 p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 animate-in slide-in-from-top-4 duration-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Event Date</label>
                     <input name="date" type="date" required className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold shadow-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Type</label>
                     <select name="type" className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold shadow-sm">
                       <option value="vacation">Annual Vacation</option>
                       <option value="sick">Medical / Sick Leave</option>
                       <option value="absence">Unexcused Absence</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Duration (Days)</label>
                     <input name="duration" type="number" step="0.5" required min="0.5" className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold shadow-sm" placeholder="e.g. 1.0" />
                   </div>
                   <div className="md:col-span-full space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Annotation</label>
                     <input name="comment" className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold shadow-sm" placeholder="Reason or remarks..." />
                   </div>
                 </div>
                 <button type="submit" className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-colors">Commit to Attendance Log</button>
               </form>
             )}

             {showForm === 'evaluations' && (
               <form onSubmit={handleSaveEvaluation} className="mb-10 p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 animate-in slide-in-from-top-4 duration-300">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Fiscal Year</label>
                     <input name="year" type="number" required defaultValue={new Date().getFullYear()} className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold shadow-sm" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Rating Category</label>
                     <select name="rating" className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold shadow-sm">
                       <option value="Meets">Meets Standards</option>
                       <option value="Exceeds">Exceeds Standards</option>
                       <option value="Below">Below Standards</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Efficiency Score (0-100)</label>
                     <input name="score" type="number" required min="0" max="100" defaultValue="80" className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold shadow-sm" />
                   </div>
                   <div className="md:col-span-full space-y-1.5">
                     <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Detailed Analysis</label>
                     <textarea name="summary" required rows={4} className="w-full px-5 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold shadow-sm" placeholder="Summary of achievements and issues..."></textarea>
                   </div>
                 </div>
                 <button type="submit" className="mt-8 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700">Seal Performance Review</button>
               </form>
             )}

             {showForm === 'work_issues' && (
               <form onSubmit={handleSaveWorkIssue} className="mb-10 p-8 bg-slate-900 text-white rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4 duration-300">
                 <div className="space-y-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Issue Heading</label>
                     <input name="title" required className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none" placeholder="e.g. Equipment Mismanagement" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">Technical Detail</label>
                     <textarea name="text" required rows={4} className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white outline-none" placeholder="Describe the professional or operational issue..."></textarea>
                   </div>
                 </div>
                 <button type="submit" className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-500">Record Work Issue</button>
               </form>
             )}

             {showForm === 'behaviour_issues' && (
               <form onSubmit={handleSaveBehaviourIssue} className="mb-10 p-8 bg-amber-50 rounded-[2rem] border border-amber-100 animate-in slide-in-from-top-4 duration-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Date Observed</label>
                     <input name="date" type="date" required className="w-full px-5 py-3 bg-white border border-amber-100 rounded-xl text-sm font-bold shadow-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Current State</label>
                     <select name="status" className="w-full px-5 py-3 bg-white border border-amber-100 rounded-xl text-sm font-bold shadow-sm">
                       <option value="open">Under Investigation</option>
                       <option value="closed">Resolved</option>
                     </select>
                   </div>
                   <div className="md:col-span-full space-y-1.5">
                     <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Behavioural Observation (Write the issue below)</label>
                     <textarea name="description" required rows={4} className="w-full px-5 py-3 bg-white border border-amber-100 rounded-xl text-sm font-bold shadow-sm" placeholder="Detail the specific behavioural concern..."></textarea>
                   </div>
                   <div className="md:col-span-full space-y-1.5">
                     <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Remediation Plan</label>
                     <input name="actionPlan" className="w-full px-5 py-3 bg-white border border-amber-100 rounded-xl text-sm font-bold shadow-sm" placeholder="Steps for improvement..." />
                   </div>
                 </div>
                 <button type="submit" className="mt-8 w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-amber-700">Log Behavioural Incident</button>
               </form>
             )}

             {/* Tab Content Display */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {activeTab === 'leaves' && (
                 empAttendance.length === 0 ? <p className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">Registry Empty</p> : 
                 empAttendance.map(l => (
                   <div key={l.id} className="p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center justify-between">
                     <div className="flex items-center space-x-6">
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
                   </div>
                 ))
               )}

               {activeTab === 'evaluations' && (
                 empEvals.length === 0 ? <p className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No historical data</p> : 
                 empEvals.map(ev => (
                   <div key={ev.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl transition-all relative mb-4">
                     <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl">{ev.year}</div>
                         <div>
                           <p className="text-xl font-black text-slate-900 tracking-tight">Efficiency Score</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref: {ev.date}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                           ev.rating === 'Exceeds' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                           ev.rating === 'Meets' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-red-50 text-red-600 border-red-100'
                         }`}>{ev.rating}</span>
                         <p className="text-3xl font-black text-slate-900 mt-2">{ev.score}%</p>
                       </div>
                     </div>
                     <p className="text-slate-600 font-medium italic text-sm leading-relaxed">"${ev.summary}"</p>
                   </div>
                 ))
               )}

               {activeTab === 'work_issues' && (
                 empWorkIssues.length === 0 ? <p className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">Log Clear</p> : 
                 empWorkIssues.map(note => (
                   <div key={note.id} className="p-8 border border-slate-100 bg-slate-900 text-white rounded-[2.5rem] hover:shadow-xl transition-all mb-4">
                     <div className="flex justify-between items-start mb-4">
                       <h5 className="text-lg font-black tracking-tight text-indigo-400 uppercase">{note.title}</h5>
                       <span className="text-[9px] font-black opacity-40">{note.date}</span>
                     </div>
                     <p className="text-slate-300 text-sm leading-relaxed mb-4">{note.text}</p>
                     <div className="pt-4 border-t border-white/5 flex items-center space-x-2">
                       <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-black">{note.authorName.charAt(0)}</div>
                       <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Witnessed by {note.authorName}</span>
                     </div>
                   </div>
                 ))
               )}

               {activeTab === 'behaviour_issues' && (
                 empBehaviourIssues.length === 0 ? <p className="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-[10px]">Behaviour Clean</p> : 
                 empBehaviourIssues.map(o => (
                   <div key={o.id} className="p-8 border border-slate-100 rounded-[2.5rem] bg-white hover:shadow-2xl transition-all duration-500 mb-4 border-l-8 border-amber-400">
                     <div className="flex justify-between items-center mb-6">
                       <span className="text-lg font-black text-slate-800 tracking-tight">{o.date}</span>
                       <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         o.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                       }`}>{o.status}</span>
                     </div>
                     <p className="text-slate-600 font-medium text-sm mb-6 leading-relaxed">{o.description}</p>
                     {o.actionPlan && (
                       <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-800 font-bold">
                         <span className="text-amber-600/50 uppercase tracking-widest mb-1 block">Remediation:</span>
                         {o.actionPlan}
                       </div>
                     )}
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
