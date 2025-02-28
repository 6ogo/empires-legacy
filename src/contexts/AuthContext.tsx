// Authentication Fix: Enhanced AuthContext.tsx

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

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Refreshing session...');

      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session refresh error:', error);
        throw error;
      }

      if (currentSession?.user) {
        console.log('Session found:', currentSession.user.email);
        setSession(currentSession);
        setUser(currentSession.user);

        const userProfile = await fetchProfile(currentSession.user.id);
        if (userProfile) {
          console.log('Profile found:', userProfile.username);
          setProfile(userProfile);
        } else {
          console.warn('No profile found for user:', currentSession.user.id);
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } else {
        console.log('No active session');
        setSession(null);
        setUser(null);
        setProfile(null);
      }

      // Use the updated profile variable, not userProfile
      return;
    } catch (error) {
      console.error('Error refreshing session:', error);
      setError(error instanceof Error ? error : new Error('Session refresh failed'));
      setSession(null);
      setUser(null);
      setProfile(null);
      return;
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
      toast.success('Signed out successfully');
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
    let subscription = null;

    const initialize = async () => {
      try {
        console.log('Initializing auth state...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (currentSession?.user) {
          console.log('Session found, user:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);

          // Add a check to prevent refetching if profile already exists
          if (!profile) {
            try {
              const userProfile = await fetchProfile(currentSession.user.id);
              if (userProfile && mounted) {
                console.log('Profile found:', userProfile.username);
                setProfile(userProfile);
              }
            } catch (profileError) {
              console.error('Error fetching profile:', profileError);
            }
          }
        } else {
          console.log('No session found during initialization');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
          console.log('Auth initialization complete');
        }
      }
    };

    initialize();

    // Subscribe to auth changes only if not already subscribed
    if (!subscription) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);
        // Handle auth state changes...
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
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