
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
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (emp: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addEvaluation: (ev: Omit<PerformanceEvaluation, 'id'>) => Promise<void>;
  addNote: (note: Omit<ManagerNote, 'id'>) => Promise<void>;
  addLeave: (leave: Omit<LeaveRecord, 'id'>) => Promise<void>;
  addObservation: (obs: Omit<Observation, 'id'>) => Promise<void>;
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
    try {
      const [
        { data: empData, error: empErr },
        { data: deptData, error: deptErr },
        { data: evalData, error: evalErr },
        { data: noteData, error: noteErr },
        { data: leaveData, error: leaveErr },
        { data: obsData, error: obsErr }
      ] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('departments').select('name'),
        supabase.from('evaluations').select('*'),
        supabase.from('work_issues').select('*'),
        supabase.from('attendance_logs').select('*'),
        supabase.from('behaviour_issues').select('*')
      ]);

      if (empErr) console.warn("Failed to fetch employees:", empErr);
      if (empData) setEmployees(empData.map(e => ({ 
        id: e.id,
        name: e.name || 'Unknown',
        username: e.username || 'user',
        role: e.role || 'employee',
        department: e.department || 'Unassigned',
        email: e.email || '',
        password: e.password || '',
        active: e.active ?? true,
        overallScore: e.overall_score ?? 0, 
        hireDate: e.hire_date || new Date().toISOString().split('T')[0], 
        profilePicture: e.profile_picture 
      })));

      if (deptErr) console.warn("Failed to fetch departments:", deptErr);
      if (deptData) setDepartments(deptData.map(d => d.name));

      if (evalErr) console.warn("Failed to fetch evaluations:", evalErr);
      if (evalData) setEvaluations(evalData.map(ev => ({
        id: ev.id,
        employeeId: ev.employee_id,
        year: ev.year,
        date: ev.date,
        score: ev.score,
        summary: ev.summary,
        rating: ev.rating
      })));

      if (noteErr) console.warn("Failed to fetch work issues:", noteErr);
      if (noteData) setNotes(noteData.map(n => ({ 
        id: n.id,
        employeeId: n.employee_id, 
        authorId: n.author_id, 
        authorName: n.author_name,
        date: n.date,
        title: n.title,
        text: n.text
      })));

      if (leaveErr) console.warn("Failed to fetch leaves:", leaveErr);
      if (leaveData) setLeaves(leaveData.map(l => ({ 
        id: l.id,
        employeeId: l.employee_id,
        date: l.date,
        type: l.type,
        duration: l.duration,
        comment: l.comment
      })));

      if (obsErr) console.warn("Failed to fetch observations:", obsErr);
      if (obsData) setObservations(obsData.map(o => ({ 
        id: o.id,
        employeeId: o.employee_id, 
        date: o.date,
        description: o.description,
        status: o.status,
        actionPlan: o.action_plan 
      })));
    } catch (err) {
      console.error("Critical: Data Sync Failure", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEmployee = async (emp: Omit<Employee, 'id'>) => {
    const { error } = await supabase.from('employees').insert([{
      username: emp.username,
      name: emp.name,
      role: emp.role,
      department: emp.department,
      email: emp.email,
      password: emp.password || 'password', // Default password for new users
      hire_date: emp.hireDate,
      active: emp.active,
      overall_score: emp.overallScore,
      profile_picture: emp.profilePicture
    }]);
    if (!error) refreshData();
    else console.error("Add employee failed:", error);
  };

  const updateEmployee = async (emp: Employee) => {
    const { error } = await supabase.from('employees').update({
      name: emp.name,
      role: emp.role,
      department: emp.department,
      email: emp.email,
      password: emp.password,
      hire_date: emp.hireDate,
      active: emp.active,
      overall_score: emp.overallScore,
      profile_picture: emp.profilePicture
    }).eq('id', emp.id);
    if (!error) refreshData();
    else console.error("Update employee failed:", error);
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) refreshData();
    else console.error("Delete employee failed:", error);
  };
  
  const addEvaluation = async (ev: Omit<PerformanceEvaluation, 'id'>) => {
    const { error } = await supabase.from('evaluations').insert([{
      employee_id: ev.employeeId,
      year: ev.year,
      date: ev.date,
      score: ev.score,
      summary: ev.summary,
      rating: ev.rating
    }]);
    if (error) console.error("Add evaluation failed:", error);
    else refreshData();
  };

  const addNote = async (note: Omit<ManagerNote, 'id'>) => {
    const { error } = await supabase.from('work_issues').insert([{
      employee_id: note.employeeId,
      author_id: note.authorId,
      author_name: note.authorName,
      date: note.date,
      title: note.title,
      text: note.text
    }]);
    if (error) console.error("Add work issue failed:", error);
    else refreshData();
  };

  const addLeave = async (leave: Omit<LeaveRecord, 'id'>) => {
    const { error } = await supabase.from('attendance_logs').insert([{
      employee_id: leave.employeeId,
      date: leave.date,
      type: leave.type,
      duration: leave.duration,
      comment: leave.comment
    }]);
    if (error) console.error("Add attendance log failed:", error);
    else refreshData();
  };

  const addObservation = async (obs: Omit<Observation, 'id'>) => {
    const { error } = await supabase.from('behaviour_issues').insert([{
      employee_id: obs.employeeId,
      date: obs.date,
      description: obs.description,
      status: obs.status,
      action_plan: obs.actionPlan
    }]);
    if (error) console.error("Add behaviour issue failed:", error);
    else refreshData();
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
