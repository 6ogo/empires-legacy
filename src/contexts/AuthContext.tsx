// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchProfile } from '@/utils/profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const refreshProfile = useCallback(async () => {
    if (!user) return;

    try {
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        console.warn('No profile found during refresh for user:', user.id);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [user]);

  // src/contexts/AuthContext.tsx
  // Fix the refreshSession function to update isInitialized state

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const userProfile = await fetchProfile(currentSession.user.id);

        if (userProfile) {
          setProfile(userProfile);
        } else {
          console.warn('No profile found during session refresh for user:', currentSession.user.id);
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setError(error instanceof Error ? error : new Error('Session refresh failed'));
      setSession(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Initial session check and auth state listener
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log('Initializing auth state...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          console.log('Session found, setting user:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);

          try {
            const userProfile = await fetchProfile(currentSession.user.id);

            if (userProfile && mounted) {
              console.log('Profile found, setting profile');
              setProfile(userProfile);
            } else if (mounted) {
              console.warn('No profile found for user during initialization:', currentSession.user.id);
            }
          } catch (profileError) {
            console.error('Error fetching profile during initialization:', profileError);
            if (mounted) {
              setError(profileError instanceof Error ? profileError : new Error('Profile fetch failed'));
            }
          }
        } else {
          console.log('No session found during initialization');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Auth initialization failed'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
          console.log('Auth initialization complete');
        }
      }
    };

    initialize();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);
      setIsLoading(true);

      if (newSession?.user) {
        console.log('Auth state change - user found:', newSession.user.email);
        setSession(newSession);
        setUser(newSession.user);

        try {
          const userProfile = await fetchProfile(newSession.user.id);

          if (userProfile && mounted) {
            console.log('Auth state change - profile found and set');
            setProfile(userProfile);
          } else if (mounted) {
            console.warn('Auth state change - no profile found for user:', newSession.user.id);
          }
        } catch (profileError) {
          console.error('Error fetching profile during auth state change:', profileError);
          if (mounted) {
            setError(profileError instanceof Error ? profileError : new Error('Profile fetch failed'));
          }
        }
      } else {
        console.log('Auth state change - no session/user');
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      }

      if (mounted) {
        setIsLoading(false);
        setIsInitialized(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isInitialized,
    error,
    signOut,
    refreshProfile,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}