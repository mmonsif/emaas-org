
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../constants';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Icons.Dashboard />, roles: ['admin', 'manager', 'employee'] },
    { name: 'Employees', path: '/employees', icon: <Icons.Users />, roles: ['admin', 'manager'] },
    { name: 'My Profile', path: `/employees/${user.id}`, icon: <Icons.Users />, roles: ['employee'] },
    { name: 'Settings', path: '/settings', icon: <Icons.Settings />, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">SP</div>
          <span className="text-xl font-bold tracking-tight">Staff Performance</span>
        </div>
        <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
          <Icons.X />
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Icons.Logout />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500" onClick={() => setIsSidebarOpen(true)}>
              <Icons.Menu />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 truncate">
              {filteredNav.find(n => n.path === location.pathname)?.name || 'Management'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold uppercase shrink-0">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </section>
      </main>
    </div>
  );
};

export default Layout;
