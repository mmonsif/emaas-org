
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setIsLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (data && !error) {
        setUser({
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role as UserRole,
          department: data.department,
          email: data.email
        });
      } else {
        // If the record is missing in the employees table, auto-create a basic one
        // This handles users created in Supabase Auth that don't have a profile record yet.
        const defaultProfile = {
          id: authUser.id,
          username: authUser.email.split('@')[0],
          name: authUser.email.split('@')[0],
          role: 'employee', 
          department: 'Ramp Operations',
          email: authUser.email,
          overall_score: 80,
          active: true,
          hire_date: new Date().toISOString().split('T')[0]
        };
        
        const { error: insertError } = await supabase.from('employees').insert([defaultProfile]);
        
        if (!insertError) {
          setUser({
            id: defaultProfile.id,
            username: defaultProfile.username,
            name: defaultProfile.name,
            role: defaultProfile.role as UserRole,
            department: defaultProfile.department,
            email: defaultProfile.email
          });
        }
      }
    } catch (e) {
      console.error("Error retrieving user profile context:", e);
    }
  };

  const login = async (email: string, password: string, requestedRole: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        // fetchUserProfile will be triggered by onAuthStateChange
        return true;
      }
      return false;
    } catch (error) {
      console.error("Authentication process failed:", error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
