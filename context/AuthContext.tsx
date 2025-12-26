
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
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
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (e) {
        console.error("Session initialization failed:", e);
      } finally {
        // Ensure we stop loading even if an error occurs
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        await fetchUserProfile(session.user);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
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
        // Auto-provision profile if missing
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
        
        const { error: insertError } = await supabase.from('employees').upsert([defaultProfile]);
        
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

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          return { 
            success: false, 
            message: "Email not confirmed. Please check your inbox or disable 'Confirm Email' in Supabase Dashboard." 
          };
        }
        throw error;
      }

      if (data.user) {
        return { success: true };
      }
      return { success: false, message: "Authentication failed. Please check your credentials." };
    } catch (error: any) {
      console.error("Authentication process failed:", error);
      return { success: false, message: error.message || "An unexpected error occurred." };
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
