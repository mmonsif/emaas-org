
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password, role);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Invalid credentials or account inactive.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 lg:p-10 border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-white font-bold text-2xl mb-4 shadow-lg">SP</div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Performance</h2>
          <p className="text-slate-500 text-sm mt-1">Personnel Management System</p>
        </div>

        {/* Role Selection */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          {(['admin', 'manager', 'employee'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${role === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center animate-in fade-in slide-in-from-top-2">
              <span className="block mb-1">⚠️ Access Denied</span>
              <span className="font-medium opacity-80">{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
              required
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl transform transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Help & Support</p>
          <div className="flex justify-center gap-4 text-xs font-semibold text-slate-500">
            <button className="hover:text-indigo-600">Forgot Password?</button>
            <span className="text-slate-300">|</span>
            <button className="hover:text-indigo-600">Contact IT</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
