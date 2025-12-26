
export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  password?: string;
}

export interface PerformanceEvaluation {
  id: string;
  employeeId: string;
  year: number;
  date: string;
  score: number; // 0-100
  summary: string;
  rating: 'Exceeds' | 'Meets' | 'Below';
}

export interface ManagerNote {
  id: string;
  employeeId: string;
  date: string;
  authorId: string;
  authorName: string;
  title: string;
  text: string;
}

export type LeaveType = 'absence' | 'vacation' | 'sick';

export interface LeaveRecord {
  id: string;
  employeeId: string;
  date: string;
  type: LeaveType;
  duration: number; // days or hours
  comment?: string;
}

export interface Observation {
  id: string;
  employeeId: string;
  date: string;
  description: string;
  status: 'open' | 'closed';
  actionPlan?: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  hireDate: string;
  username: string;
  password?: string;
  active: boolean;
  overallScore: number; // Latest evaluation score
  profilePicture?: string; // Base64 string
}

export interface DashboardStats {
  totalEmployees: number;
  performanceBreakdown: Record<string, number>;
  departmentDistribution: { name: string; value: number }[];
  teamStats?: {
    avgScore: number;
    teamSize: number;
    openObservations: number;
  };
}
