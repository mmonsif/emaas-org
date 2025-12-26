
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const initializationStarted = useRef(false);

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    // Safety timeout: Never let the app hang on "Loading session" for more than 5 seconds
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth initialization timed out. Forcing UI load.");
        setIsLoading(false);
      }
    }, 5000);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase session error:", error);
        }

        if (session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (e) {
        console.error("Critical Auth initialization failure:", e);
      } finally {
        setIsLoading(false);
        clearTimeout(safetyTimer);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.debug("Auth state changed:", event);
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        await fetchUserProfile(session.user);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
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
          username: data.username || authUser.email.split('@')[0],
          name: data.name || 'User',
          role: (data.role as UserRole) || 'employee',
          department: data.department || 'Ramp Operations',
          email: data.email || authUser.email
        });
      } else {
        // Create profile if it doesn't exist (Auto-provisioning)
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
      console.error("fetchUserProfile failed:", e);
    }
  };

  const login = async (email: string, password: string, requestedRole: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          return { 
            success: false, 
            message: "Email not confirmed. Please check your inbox for a verification link or disable 'Confirm Email' in your Supabase Auth settings." 
          };
        }
        return { success: false, message: error.message };
      }

      if (data.user) {
        return { success: true };
      }
      return { success: false, message: "Authentication failed. No user returned." };
    } catch (error: any) {
      return { success: false, message: error.message || "An unexpected network error occurred." };
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
