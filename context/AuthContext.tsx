
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Persistent login check via localStorage
    const savedUser = localStorage.getItem('skyport_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('skyport_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, requestedRole: UserRole) => {
    try {
      // Manual query to employees table for authentication
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { success: false, message: "User not found or account inactive." };
      }

      // Plain text check (In production, use hashed passwords)
      if (data.password !== password) {
        return { success: false, message: "Invalid credentials." };
      }

      // Check role authorization
      if (data.role !== requestedRole && requestedRole !== 'employee') {
        return { success: false, message: `Access denied. You do not have ${requestedRole} privileges.` };
      }

      const authenticatedUser: User = {
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role as UserRole,
        department: data.department,
        email: data.email
      };

      setUser(authenticatedUser);
      localStorage.setItem('skyport_user', JSON.stringify(authenticatedUser));
      return { success: true };

    } catch (err: any) {
      console.error("Manual Auth Error:", err);
      return { success: false, message: err.message || "Connection failure." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skyport_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
