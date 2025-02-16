
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AuthContextType, Profile } from '@/types/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      if (data) {
        console.log('Profile data fetched:', data);
        const profileData = data as Profile;
        const defaultPreferences = {
          stayLoggedIn: false,
          theme: undefined as 'light' | 'dark' | undefined,
          notifications: { email: false, push: false }
        };

        const userProfile: UserProfile = {
          id: profileData.id,
          username: profileData.username || undefined,
          avatarUrl: profileData.avatar_url || undefined,
          verified: !!profileData.verified,
          email_verified: !!profileData.email_verified,
          preferences: typeof profileData.preferences === 'object' 
            ? { ...defaultPreferences, ...profileData.preferences as any }
            : defaultPreferences,
          xp: Number(profileData.xp || 0),
          level: Number(profileData.level || 1),
          total_gametime: Number(profileData.total_gametime || 0),
          total_games_played: Number(profileData.total_games_played || 0),
          total_wins: Number(profileData.total_wins || 0),
          economic_wins: Number(profileData.economic_wins || 0),
          domination_wins: Number(profileData.domination_wins || 0),
          createdAt: profileData.created_at,
          updatedAt: profileData.created_at,
          lastLoginAt: profileData.last_login || undefined
        };
        setProfile(userProfile);
      } else {
        console.log('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      console.log('Session refresh result:', currentSession ? 'Session found' : 'No session');
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
      setError(err instanceof Error ? err : new Error('Session refresh failed'));
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
    setIsLoading(true);

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Initial session error:', sessionError);
          throw sessionError;
        }
        
        console.log('Initial session check:', initialSession ? 'Session found' : 'No session');
        
        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err : new Error('Auth initialization failed'));
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          try {
            await fetchProfile(currentSession.user.id);
          } catch (error) {
            console.error('Error fetching profile on auth change:', error);
            toast.error('Failed to load user profile');
          }
        } else {
          setProfile(null);
        }
      }
    );

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
