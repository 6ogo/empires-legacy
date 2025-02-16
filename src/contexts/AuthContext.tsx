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
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setUser(currentUser);
      
      // Fetch profile with error handling
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
  
      if (fetchError) {
        console.error('Profile fetch error:', fetchError);
        setProfile(null);
        return;
      }
  
      // Important: Wait for profile to be set
      await new Promise(resolve => {
        setProfile(profileData as UserProfile);
        resolve(true);
      });
  
    } catch (error) {
      console.error('Error in updateUserAndProfile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
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
    let mounted = true;
  
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth');
        setIsLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
  
        if (session?.user) {
          console.log('Session found, updating user and profile');
          setSession(session);
          await updateUserAndProfile(session.user);
        } else {
          console.log('No session found');
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err as Error);
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
  
      try {
        setIsLoading(true);
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
        if (mounted) {
          setIsLoading(false);
        }
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