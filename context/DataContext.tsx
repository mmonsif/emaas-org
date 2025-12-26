
import React, { createContext, useContext, useState } from 'react';
import { Employee, PerformanceEvaluation, ManagerNote, LeaveRecord, Observation } from '../types';
import { MOCK_EMPLOYEES, MOCK_EVALUATIONS, MOCK_NOTES, MOCK_LEAVES, MOCK_OBSERVATIONS, INITIAL_DEPARTMENTS } from '../constants';

interface DataContextType {
  employees: Employee[];
  departments: string[];
  evaluations: PerformanceEvaluation[];
  notes: ManagerNote[];
  leaves: LeaveRecord[];
  observations: Observation[];
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  addEvaluation: (ev: PerformanceEvaluation) => void;
  addNote: (note: ManagerNote) => void;
  addLeave: (leave: LeaveRecord) => void;
  addObservation: (obs: Observation) => void;
  addDepartment: (name: string) => void;
  deleteDepartment: (name: string) => void;
  updateDepartment: (oldName: string, newName: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [departments, setDepartments] = useState<string[]>(INITIAL_DEPARTMENTS);
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>(MOCK_EVALUATIONS);
  const [notes, setNotes] = useState<ManagerNote[]>(MOCK_NOTES);
  const [leaves, setLeaves] = useState<LeaveRecord[]>(MOCK_LEAVES);
  const [observations, setObservations] = useState<Observation[]>(MOCK_OBSERVATIONS);

  const addEmployee = (emp: Employee) => setEmployees(prev => [...prev, emp]);
  const updateEmployee = (emp: Employee) => setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
  const deleteEmployee = (id: string) => setEmployees(prev => prev.filter(e => e.id !== id));
  
  const addEvaluation = (ev: PerformanceEvaluation) => {
    setEvaluations(prev => [...prev, ev]);
    setEmployees(prev => prev.map(e => e.id === ev.employeeId ? { ...e, overallScore: ev.score } : e));
  };

  const addNote = (note: ManagerNote) => setNotes(prev => [...prev, note]);
  const addLeave = (leave: LeaveRecord) => setLeaves(prev => [...prev, leave]);
  const addObservation = (obs: Observation) => setObservations(prev => [...prev, obs]);

  const addDepartment = (name: string) => {
    if (!departments.includes(name)) setDepartments(prev => [...prev, name]);
  };

  const deleteDepartment = (name: string) => {
    setDepartments(prev => prev.filter(d => d !== name));
  };

  const updateDepartment = (oldName: string, newName: string) => {
    setDepartments(prev => prev.map(d => d === oldName ? newName : d));
    setEmployees(prev => prev.map(e => e.department === oldName ? { ...e, department: newName } : e));
  };

  return (
    <DataContext.Provider value={{ 
      employees, departments, evaluations, notes, leaves, observations,
      addEmployee, updateEmployee, deleteEmployee,
      addEvaluation, addNote, addLeave, addObservation,
      addDepartment, deleteDepartment, updateDepartment
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
