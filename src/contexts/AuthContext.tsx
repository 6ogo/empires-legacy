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
      setIsLoading(false);
      return;
    }
  
    try {
      setUser(currentUser);
      console.log('Fetching profile for user:', currentUser.id);
      
      // First try to get the profile
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
  
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw fetchError;
      }
  
      if (profileData) {
        console.log('Existing profile found:', profileData);
        setProfile(profileData as UserProfile);
        setIsLoading(false);
        return;
      }
  
      console.log('No profile found, creating new profile');
      // Create new profile if none exists
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0],
            email_verified: !!currentUser.email_confirmed_at,
            verified: false,
            is_guest: false,
            preferences: { stayLoggedIn: false },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select('*')
        .single();
  
      if (createError) throw createError;
  
      if (newProfile) {
        console.log('New profile created:', newProfile);
        setProfile(newProfile as UserProfile);
      }
  
    } catch (err) {
      console.error('Error in updateUserAndProfile:', err);
      setError(err as Error);
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