
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, PerformanceEvaluation, ManagerNote, LeaveRecord, Observation } from '../types';
import { supabase } from '../services/supabase';

interface DataContextType {
  employees: Employee[];
  departments: string[];
  evaluations: PerformanceEvaluation[];
  notes: ManagerNote[];
  leaves: LeaveRecord[];
  observations: Observation[];
  addEmployee: (emp: Employee) => Promise<void>;
  updateEmployee: (emp: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addEvaluation: (ev: PerformanceEvaluation) => Promise<void>;
  addNote: (note: ManagerNote) => Promise<void>;
  addLeave: (leave: LeaveRecord) => Promise<void>;
  addObservation: (obs: Observation) => Promise<void>;
  addDepartment: (name: string) => Promise<void>;
  deleteDepartment: (name: string) => Promise<void>;
  updateDepartment: (oldName: string, newName: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [notes, setNotes] = useState<ManagerNote[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);

  const refreshData = async () => {
    const [
      { data: empData },
      { data: deptData },
      { data: evalData },
      { data: noteData },
      { data: leaveData },
      { data: obsData }
    ] = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('departments').select('name'),
      supabase.from('evaluations').select('*'),
      supabase.from('work_issues').select('*'),
      supabase.from('attendance_logs').select('*'),
      supabase.from('behaviour_issues').select('*')
    ]);

    if (empData) setEmployees(empData.map(e => ({ ...e, overallScore: e.overall_score, hireDate: e.hire_date, profilePicture: e.profile_picture })));
    if (deptData) setDepartments(deptData.map(d => d.name));
    if (evalData) setEvaluations(evalData);
    if (noteData) setNotes(noteData.map(n => ({ ...n, employeeId: n.employee_id, authorId: n.author_id, authorName: n.author_name })));
    if (leaveData) setLeaves(leaveData.map(l => ({ ...l, employeeId: l.employee_id })));
    if (obsData) setObservations(obsData.map(o => ({ ...o, employeeId: o.employee_id, actionPlan: o.action_plan })));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEmployee = async (emp: Employee) => {
    // Note: Creating a full auth user requires supabase.auth.signUp or admin functions
    // For this context, we'll just insert into the table (assuming user exists or is being added elsewhere)
    const { error } = await supabase.from('employees').insert([{
      id: emp.id,
      username: emp.username,
      name: emp.name,
      role: emp.role,
      department: emp.department,
      email: emp.email,
      hire_date: emp.hireDate,
      active: emp.active,
      overall_score: emp.overallScore,
      profile_picture: emp.profilePicture
    }]);
    if (!error) refreshData();
  };

  const updateEmployee = async (emp: Employee) => {
    const { error } = await supabase.from('employees').update({
      name: emp.name,
      role: emp.role,
      department: emp.department,
      email: emp.email,
      hire_date: emp.hireDate,
      active: emp.active,
      overall_score: emp.overallScore,
      profile_picture: emp.profilePicture
    }).eq('id', emp.id);
    if (!error) refreshData();
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) refreshData();
  };
  
  const addEvaluation = async (ev: PerformanceEvaluation) => {
    const { error } = await supabase.from('evaluations').insert([{
      employee_id: ev.employeeId,
      year: ev.year,
      date: ev.date,
      score: ev.score,
      summary: ev.summary,
      rating: ev.rating
    }]);
    if (!error) refreshData();
  };

  const addNote = async (note: ManagerNote) => {
    const { error } = await supabase.from('work_issues').insert([{
      employee_id: note.employeeId,
      author_id: note.authorId,
      author_name: note.authorName,
      date: note.date,
      title: note.title,
      text: note.text
    }]);
    if (!error) refreshData();
  };

  const addLeave = async (leave: LeaveRecord) => {
    const { error } = await supabase.from('attendance_logs').insert([{
      employee_id: leave.employeeId,
      date: leave.date,
      type: leave.type,
      duration: leave.duration,
      comment: leave.comment
    }]);
    if (!error) refreshData();
  };

  const addObservation = async (obs: Observation) => {
    const { error } = await supabase.from('behaviour_issues').insert([{
      employee_id: obs.employeeId,
      date: obs.date,
      description: obs.description,
      status: obs.status,
      action_plan: obs.actionPlan
    }]);
    if (!error) refreshData();
  };

  const addDepartment = async (name: string) => {
    const { error } = await supabase.from('departments').insert([{ name }]);
    if (!error) refreshData();
  };

  const deleteDepartment = async (name: string) => {
    const { error } = await supabase.from('departments').delete().eq('name', name);
    if (!error) refreshData();
  };

  const updateDepartment = async (oldName: string, newName: string) => {
    const { error } = await supabase.from('departments').update({ name: newName }).eq('name', oldName);
    if (!error) refreshData();
  };

  return (
    <DataContext.Provider value={{ 
      employees, departments, evaluations, notes, leaves, observations,
      addEmployee, updateEmployee, deleteEmployee,
      addEvaluation, addNote, addLeave, addObservation,
      addDepartment, deleteDepartment, updateDepartment,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
