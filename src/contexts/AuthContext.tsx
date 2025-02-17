import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from '@/types/auth';
import { User, Session } from '@supabase/supabase-js';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          username: data.username || undefined,
          verified: !!data.verified,
          email_verified: !!data.email_verified,
          preferences: data.preferences as UserProfile['preferences'],
          avatarUrl: data.avatar_url || undefined,
          createdAt: data.created_at,
          updatedAt: data.created_at,
          lastLoginAt: data.last_login || undefined,
          total_gametime: Number(data.total_gametime || 0),
          total_games_played: Number(data.total_games_played || 0),
          total_wins: Number(data.total_wins || 0),
          economic_wins: Number(data.economic_wins || 0),
          domination_wins: Number(data.domination_wins || 0),
          xp: Number(data.xp || 0),
          level: Number(data.level || 1)
        };
        
        setProfile(userProfile);
        return userProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session: refreshedSession }, error } = 
        await supabase.auth.refreshSession();
      
      if (error) throw error;

      if (refreshedSession?.user) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        const profile = await fetchProfile(refreshedSession.user.id);
        if (!profile) {
          throw new Error('Profile not found after session refresh');
        }
      } else {
        // Clear auth state if no session
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setError(error instanceof Error ? error : new Error('Session refresh failed'));
      // Clear auth state on refresh failure
      setSession(null);
      setUser(null);
      setProfile(null);
      throw error; // Re-throw to handle in components
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error('Sign out failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            const profile = await fetchProfile(currentSession.user.id);
            if (!profile) {
              console.error('No profile found for user:', currentSession.user.id);
            }
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Auth initialization failed'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (mounted) {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            const profile = await fetchProfile(newSession.user.id);
            if (!profile) {
              console.error('No profile found after auth state change');
            }
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading: isLoading && !isInitialized,
    error,
    signOut,
    refreshProfile: async () => {
      if (user) {
        await fetchProfile(user.id);
      }
    },
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}