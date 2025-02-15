import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';
import { fetchProfile } from '@/utils/profile';

const PERSIST_KEY = 'auth:session';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const handleError = useCallback((error: Error) => {
    console.error('Auth error:', error);
    setError(error);
    toast.error(error.message);
  }, []);

  const initialize = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    } catch (error) {
      handleError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem(PERSIST_KEY);
      navigate('/');
    } catch (error: any) {
      handleError(error);
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      }
    } catch (error) {
      handleError(error as Error);
    }
  }, [handleError]);

  useEffect(() => {
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  const value = {
    user,
    profile,
    session,
    isLoading: loading,
    error,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
