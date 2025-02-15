
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserProfile } from '@/types/auth';
import { fetchProfile } from '@/utils/profile';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const handleError = useCallback((error: Error) => {
    console.error('Auth error:', error);
    setError(error);
    setIsLoading(false);
    toast.error(error.message);
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
      navigate('/', { replace: true });
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        console.log('Refreshing session for user:', session.user.email);
        setUser(session.user);
        setSession(session);
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          console.log('Profile found:', userProfile);
          setProfile(userProfile);
        } else {
          console.log('No profile found for user');
          throw new Error('Profile not found');
        }
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial session check
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user && mounted) {
          console.log('Session found:', session.user.email);
          setUser(session.user);
          setSession(session);
          const userProfile = await fetchProfile(session.user.id);
          if (mounted && userProfile) {
            console.log('Profile loaded for user');
            setProfile(userProfile);
          } else if (mounted) {
            console.log('No profile found for user');
            setUser(null);
            setSession(null);
          }
        } else if (mounted) {
          console.log('No session found');
          setUser(null);
          setProfile(null);
          setSession(null);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          handleError(error);
        }
      } finally {
        if (mounted) {
          console.log('Auth initialization complete');
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setSession(session);
        try {
          const userProfile = await fetchProfile(session.user.id);
          if (mounted && userProfile) {
            setProfile(userProfile);
          } else if (mounted) {
            setUser(null);
            setSession(null);
            setProfile(null);
          }
        } catch (error: any) {
          handleError(error);
        }
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleError]);

  const value = {
    user,
    profile,
    session,
    isLoading,
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
