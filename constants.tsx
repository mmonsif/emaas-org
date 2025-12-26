
import React from 'react';
import { Employee, User, PerformanceEvaluation, ManagerNote, LeaveRecord, Observation } from './types';

export const INITIAL_DEPARTMENTS = [
  "Ramp Operations",
  "Baggage Handling",
  "Passenger Services",
  "Fleet Maintenance",
  "Cargo Logistics",
  "HR & Admin"
];

export const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', password: 'password', name: 'John Admin', role: 'admin', department: 'HR & Admin', email: 'admin@skyport.com' },
  { id: '2', username: 'mgr_ramp', password: 'password', name: 'Sarah Manager', role: 'manager', department: 'Ramp Operations', email: 'sarah.m@skyport.com' },
  { id: '3', username: 'emp_ramp1', password: 'password', name: 'Mike Ground', role: 'employee', department: 'Ramp Operations', email: 'mike.g@skyport.com' },
  { id: '4', username: 'emp_bagg1', password: 'password', name: 'Lisa Bags', role: 'employee', department: 'Baggage Handling', email: 'lisa.b@skyport.com' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'John Admin', department: 'HR & Admin', role: 'HR Director', email: 'admin@skyport.com', hireDate: '2020-01-15', username: 'admin', password: 'password', active: true, overallScore: 95 },
  { id: '2', name: 'Sarah Manager', department: 'Ramp Operations', role: 'Operations Manager', email: 'sarah.m@skyport.com', hireDate: '2021-03-22', username: 'mgr_ramp', password: 'password', active: true, overallScore: 88 },
  { id: '3', name: 'Mike Ground', department: 'Ramp Operations', role: 'Ground Handler', email: 'mike.g@skyport.com', hireDate: '2022-06-10', username: 'emp_ramp1', password: 'password', active: true, overallScore: 78 },
  { id: '4', name: 'Lisa Bags', department: 'Baggage Handling', role: 'Baggage Agent', email: 'lisa.b@skyport.com', hireDate: '2022-09-05', username: 'emp_bagg1', password: 'password', active: true, overallScore: 82 },
  { id: '5', name: 'Tom Tech', department: 'Fleet Maintenance', role: 'Lead Mechanic', email: 'tom.t@skyport.com', hireDate: '2019-11-30', username: 'tom_tech', password: 'password', active: true, overallScore: 92 },
];

export const MOCK_EVALUATIONS: PerformanceEvaluation[] = [
  { id: 'e1', employeeId: '3', year: 2024, date: '2024-12-01', score: 78, summary: 'Good progress, but needs better communication on ramp.', rating: 'Meets' },
  { id: 'e2', employeeId: '4', year: 2024, date: '2024-11-15', score: 82, summary: 'Reliable and punctual. Handles luggage carefully.', rating: 'Meets' },
];

export const MOCK_NOTES: ManagerNote[] = [
  { id: 'n1', employeeId: '3', date: '2024-05-12', authorId: '2', authorName: 'Sarah Manager', title: 'Late for shift', text: 'Arrived 15 minutes late for the morning ramp shift. Verbal warning given.' },
  { id: 'n2', employeeId: '3', date: '2024-07-20', authorId: '2', authorName: 'Sarah Manager', title: 'Great performance during storm', text: 'Mike handled the aircraft turnaround efficiently despite heavy rain.' },
];

export const MOCK_LEAVES: LeaveRecord[] = [
  { id: 'l1', employeeId: '3', date: '2024-08-10', type: 'sick', duration: 1, comment: 'Flu symptoms' },
  { id: 'l2', employeeId: '3', date: '2024-10-05', type: 'vacation', duration: 5, comment: 'Annual leave' },
];

export const MOCK_OBSERVATIONS: Observation[] = [
  { id: 'o1', employeeId: '3', date: '2024-09-12', description: 'Safety vest not fully zipped during refueling operation.', status: 'closed', actionPlan: 'Retraining on PPE protocols.' },
];

// Icons
export const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clipboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
};
