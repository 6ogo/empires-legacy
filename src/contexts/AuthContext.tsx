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
  const [mounted, setMounted] = useState(true);

  const updateUserAndProfile = async (currentUser: User | null) => {
    console.log('updateUserAndProfile called with user:', currentUser?.email);

    if (!currentUser) {
      console.log('No current user, clearing states');
      setUser(null);
      setProfile(null);
      setIsLoading(false); // Ensure we clear loading state here
      return;
    }

    try {
      setUser(currentUser);
      const userProfile = await fetchProfile(currentUser.id);

      if (userProfile) {
        setProfile(userProfile);
        console.log('Profile set for user:', currentUser.email);
        setIsLoading(false); // Clear loading after successful profile fetch
        return;
      }

      // Only attempt to create profile if none exists
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
    } finally {
      setIsLoading(false); // Ensure loading state is always cleared
    }
  };
  const refreshSession = async () => {
    if (!mounted) return;

    try {
      console.log('Refreshing session');
      setIsLoading(true);

      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) throw error;

      setSession(currentSession);
      if (currentSession?.user) {
        await updateUserAndProfile(currentSession.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;

    try {
      console.log('Refreshing profile for user:', user.email);
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

  const signOut = async () => {
    try {
      console.log('Signing out');
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

  useEffect(() => {
    console.log('AuthProvider mounted');
    setMounted(true);

    const initializeAuth = async () => {

      if (!mounted) return;

      try {
        console.log('Initializing auth');
        setIsLoading(true); // Set loading at the start

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted && initialSession) {
          setSession(initialSession);
          await updateUserAndProfile(initialSession.user);
        } else {
          setIsLoading(false); // Clear loading if no session
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError(err as Error);
          setIsLoading(false); // Clear loading on error
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);

      if (!mounted) return;

      try {
        setIsLoading(true);
        setSession(currentSession);

        if (currentSession?.user) {
          await updateUserAndProfile(currentSession.user);
        } else {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    });

    return () => {
      setMounted(false);
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