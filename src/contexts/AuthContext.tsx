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

  const updateUserAndProfile = async (currentUser: User | null) => {
    try {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(currentUser);
      
      // Attempt to fetch existing profile
      const userProfile = await fetchProfile(currentUser.id);
      
      if (userProfile) {
        setProfile(userProfile);
        return;
      }

      // If no profile exists, create one
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

      if (createError) {
        console.error('Error creating profile:', createError);
        // Don't throw here, just log the error
        return;
      }

      // Fetch the profile again to ensure we get the correct format
      const createdProfile = await fetchProfile(currentUser.id);
      if (createdProfile) {
        setProfile(createdProfile);
      }
    } catch (err) {
      console.error('Error in updateUserAndProfile:', err);
      // Don't set user/profile to null here, as we still want to maintain the auth state
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session refresh error:', sessionError);
        return;
      }
      
      setSession(currentSession);
      
      if (currentSession?.user) {
        await updateUserAndProfile(currentSession.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error in refreshSession:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;

    try {
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (err) {
      console.error('Profile refresh error:', err);
      toast.error('Failed to refresh profile');
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
      toast.error('Failed to sign out');
    }
  };

  useEffect(() => {
    // Initial session check
    refreshSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);
      
      setSession(currentSession);
      
      if (currentSession?.user) {
        await updateUserAndProfile(currentSession.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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