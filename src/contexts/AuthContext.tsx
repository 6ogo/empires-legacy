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
  const [isLoading, setIsLoading] = useState(true); // Start with true since we're checking auth on mount
  const [error, setError] = useState<Error | null>(null);

  const updateUserAndProfile = async (currentUser: User | null) => {
    console.log('updateUserAndProfile called with user:', currentUser?.email);

    if (!currentUser) {
      console.log('No current user, clearing states');
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      setUser(currentUser);
      console.log('User state updated:', currentUser.email);

      const userProfile = await fetchProfile(currentUser.id);
      console.log('Profile fetch result:', userProfile);

      if (userProfile) {
        setProfile(userProfile);
        console.log('Existing profile set');
        return;
      }

      console.log('No profile found, creating new profile');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: currentUser.id,
            username: currentUser.user_metadata?.username || null,
            email_verified: !!currentUser.email_confirmed_at,
            verified: false,
            is_guest: false,
            preferences: { stayLoggedIn: false },
            created_at: new Date().toISOString(),
          },
        ])
        .select('*')
        .single();

      if (createError) throw createError;

      if (newProfile) {
        const createdProfile = await fetchProfile(currentUser.id);
        if (createdProfile) {
          setProfile(createdProfile);
          console.log('New profile created and set');
        }
      }
    } catch (err) {
      console.error('Error in updateUserAndProfile:', err);
      setError(err as Error);
    }
  };

  const refreshSession = async () => {
    console.log('refreshSession called');
    try {
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      setSession(currentSession);

      if (currentSession?.user) {
        await updateUserAndProfile(currentSession.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error in refreshSession:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log('signOut called');
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setProfile(null);
      console.log('Sign out successful');
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Failed to sign out');
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    console.log('Refreshing profile for user:', user.email);

    try {
      setIsLoading(true);
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        console.log('Profile refreshed successfully');
      }
    } catch (err) {
      console.error('Profile refresh error:', err);
      toast.error('Failed to refresh profile');
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    console.log('AuthProvider mounted');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          if (initialSession) {
            setSession(initialSession);
            await updateUserAndProfile(initialSession.user);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);

      if (!mounted) return;

      setIsLoading(true);

      try {
        setSession(currentSession);

        if (currentSession?.user) {
          await updateUserAndProfile(currentSession.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  console.log('Auth Provider current state:', {
    hasSession: !!session,
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading
  });

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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };