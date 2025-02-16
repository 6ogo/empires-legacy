// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from '@/types/auth';
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshSession: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const updateUserAndProfile = async (currentUser: User) => {
    try {
      if (!currentUser) {
        setProfile(null);
        return;
      }

      console.log('Fetching profile for user:', currentUser.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('Profile data fetched:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error as Error);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      console.log('Refreshing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        throw error;
      }
      
      if (session) {
        console.log('Session found:', session.user.email);
        setSession(session);
        setUser(session.user);
        await updateUserAndProfile(session.user);
      } else {
        console.log('No session found');
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    refreshSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await updateUserAndProfile(currentSession.user);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await updateUserAndProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        error,
        signOut,
        refreshProfile,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};