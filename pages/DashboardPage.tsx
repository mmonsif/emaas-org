
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  // Fix: use departments from useData instead of undefined constant DEPARTMENTS
  const { employees, observations, departments } = useData();

  const stats = useMemo(() => {
    // Basic Counts
    const total = employees.length;
    
    // Performance Breakdown
    const breakdown = {
      Exceeds: employees.filter(e => e.overallScore >= 90).length,
      Meets: employees.filter(e => e.overallScore >= 75 && e.overallScore < 90).length,
      Below: employees.filter(e => e.overallScore < 75).length,
    };

    // Department Dist
    // Fix: use departments from context
    const dist = departments.map(dept => ({
      name: dept,
      value: employees.filter(e => e.department === dept).length
    })).filter(d => d.value > 0);

    // Manager Specific Team Stats
    let teamStats = undefined;
    if (user?.role === 'manager') {
      const team = employees.filter(e => e.department === user.department);
      teamStats = {
        avgScore: team.length ? Math.round(team.reduce((acc, curr) => acc + curr.overallScore, 0) / team.length) : 0,
        teamSize: team.length,
        openObservations: observations.filter(o => {
          const emp = employees.find(e => e.id === o.employeeId);
          return emp?.department === user.department && o.status === 'open';
        }).length,
      };
    }

    return { total, breakdown, dist, teamStats };
  }, [employees, observations, user, departments]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Employees</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>

        {user?.role !== 'employee' && (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-green-600 mb-1">Top Performers</p>
              <p className="text-3xl font-bold text-slate-900">{stats.breakdown.Exceeds}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-amber-600 mb-1">Meets Requirements</p>
              <p className="text-3xl font-bold text-slate-900">{stats.breakdown.Meets}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-red-600 mb-1">Below Standards</p>
              <p className="text-3xl font-bold text-slate-900">{stats.breakdown.Below}</p>
            </div>
          </>
        )}
      </div>

      {/* Manager Team View */}
      {user?.role === 'manager' && stats.teamStats && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h3 className="text-indigo-900 font-bold mb-4 flex items-center">
            <span className="mr-2">⚡</span> Team Overview: {user.department}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">Average Score</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.teamStats.avgScore}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">Team Size</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.teamStats.teamSize} personnel</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">Open Observations</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.teamStats.openObservations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Staffing by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dist} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.dist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Distribution</h3>
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Exceeds', value: stats.breakdown.Exceeds },
                    { name: 'Meets', value: stats.breakdown.Meets },
                    { name: 'Below', value: stats.breakdown.Below },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex space-x-6 text-xs font-medium text-slate-500 mt-2">
              <span className="flex items-center"><div className="w-3 h-3 bg-[#10b981] rounded-full mr-2"></div> Exceeds</span>
              <span className="flex items-center"><div className="w-3 h-3 bg-[#6366f1] rounded-full mr-2"></div> Meets</span>
              <span className="flex items-center"><div className="w-3 h-3 bg-[#ef4444] rounded-full mr-2"></div> Below</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
