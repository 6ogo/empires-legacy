
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
    console.log('Starting profile fetch for user:', userId);
    try {
      let profileData: Profile | null = null;
      
      // First attempt to fetch existing profile
      const { data: existingProfile, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile fetch response:', { existingProfile, error, status });

      if (error) {
        console.error('Supabase error fetching profile:', error);
        if (status === 406) {
          // Profile doesn't exist, create one
          console.log('Profile not found, attempting to create...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: userId }])
            .select()
            .single();

          if (createError) {
            console.error('Failed to create profile:', createError);
            throw createError;
          }

          console.log('New profile created:', newProfile);
          profileData = newProfile;
        } else {
          throw error;
        }
      } else {
        profileData = existingProfile;
      }
      
      if (profileData) {
        console.log('Processing profile data:', profileData);
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
        console.log('Setting profile in state:', userProfile);
        setProfile(userProfile);
      } else {
        console.log('No profile data received');
        setProfile(null);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    console.log('Refreshing profile...');
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const refreshSession = async () => {
    console.log('Refreshing session...');
    try {
      setIsLoading(true);
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      console.log('Session refresh result:', { session: currentSession, error });
      
      if (error) {
        console.error('Session refresh error:', error);
        throw error;
      }
      
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
    console.log('Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setProfile(null);
      console.log('Sign out successful');
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err : new Error('Sign out failed'));
    }
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    let mounted = true;
    setIsLoading(true);

    const initializeAuth = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session: initialSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        console.log('Initial session result:', { session: initialSession, error: sessionError });

        if (sessionError) {
          console.error('Initial session error:', sessionError);
          throw sessionError;
        }
        
        if (mounted) {
          if (initialSession?.user) {
            console.log('Setting initial session and user');
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user.id);
          } else {
            console.log('No initial session found');
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Auth initialization failed'));
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (mounted) {
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
      }
    );

    return () => {
      console.log('Cleaning up AuthProvider...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  console.log('AuthProvider render state:', { 
    hasSession: !!session, 
    hasUser: !!user, 
    hasProfile: !!profile, 
    isLoading, 
    hasError: !!error 
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
