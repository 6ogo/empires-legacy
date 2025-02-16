
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AuthContextType } from '@/types/auth';
import { toast } from 'sonner';
import { fetchProfile } from '@/utils/profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  const updateUserAndProfile = async (currentUser: User | null) => {
    try {
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await fetchProfile(currentUser.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error updating user and profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update user profile'));
      setUser(null);
      setProfile(null);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      setSession(currentSession);
      await updateUserAndProfile(currentSession?.user ?? null);
    } catch (err) {
      console.error('Session refresh error:', err);
      setError(err instanceof Error ? err : new Error('Session refresh failed'));
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      try {
        const userProfile = await fetchProfile(user.id);
        setProfile(userProfile);
      } catch (err) {
        console.error('Profile refresh error:', err);
        toast.error('Failed to refresh profile');
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    }
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);
      
      setSession(currentSession);
      await updateUserAndProfile(currentSession?.user ?? null);
      setIsLoading(false);
      setInitialized(true);
    });

    return () => {
      console.log('Cleaning up AuthProvider...');
      subscription.unsubscribe();
    };
  }, []);

  // Add debugging logs
  useEffect(() => {
    console.log('Auth state:', {
      initialized,
      isLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      hasError: !!error
    });
  }, [initialized, isLoading, user, profile, error]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading: isLoading || !initialized,
        error,
        signOut,
        refreshProfile,
        refreshSession
      }}
    >
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

export { AuthContext };
