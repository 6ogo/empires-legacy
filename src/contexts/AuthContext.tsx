// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (!data) {
        console.error('No profile found for user:', userId);
        return null;
      }

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

      return userProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const userProfile = await fetchProfile(currentSession.user.id);
        
        if (!userProfile) {
          throw new Error('Profile not found after session refresh');
        }
        
        setProfile(userProfile);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setError(error instanceof Error ? error : new Error('Session refresh failed'));
      setSession(null);
      setUser(null);
      setProfile(null);
      navigate('/auth', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, navigate]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      navigate('/auth', { replace: true });
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

    const initialize = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          const userProfile = await fetchProfile(currentSession.user.id);
          
          if (userProfile) {
            setProfile(userProfile);
          } else {
            // Handle missing profile
            console.error('No profile found for user:', currentSession.user.id);
            await signOut();
          }
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

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);

      try {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          const userProfile = await fetchProfile(newSession.user.id);
          
          if (userProfile) {
            setProfile(userProfile);
          } else {
            console.error('No profile found after auth state change');
            await signOut();
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Auth state change failed'));
          await signOut();
        }
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
  }, [fetchProfile, signOut]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    }
  }, [user, fetchProfile]);

  const value: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    error,
    signOut,
    refreshProfile,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}