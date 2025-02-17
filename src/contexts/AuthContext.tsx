import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from '@/types/auth';
import { User, Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const createProfile = async (userId: string, email?: string, username?: string) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        return existingProfile;
      }

      // Create new profile if it doesn't exist
      const newProfile = {
        id: userId,
        email: email,
        username: username || email?.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        preferences: {
          stayLoggedIn: true,
          theme: 'dark',
          notifications: {
            email: true,
            push: true
          }
        },
        verified: false,
        email_verified: false,
        is_guest: false,
        is_anonymous: false,
        xp: 0,
        level: 1,
        total_gametime: 0,
        total_games_played: 0,
        total_wins: 0,
        economic_wins: 0,
        domination_wins: 0,
        turnstile_verified: false,
        achievements: []
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data as UserProfile);
      } else {
        // If no profile exists, create one
        const newProfile = await createProfile(userId, user?.email);
        setProfile(newProfile as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch/create profile'));
    }
  };

  // Initialize auth state from stored session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error : new Error('Auth initialization failed'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchProfile(newSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;

      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        await fetchProfile(refreshedSession.user.id);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setError(error instanceof Error ? error : new Error('Session refresh failed'));
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Sign out failed'));
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};