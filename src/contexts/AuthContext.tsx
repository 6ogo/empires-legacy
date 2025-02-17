import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from '@/types/auth';
import { User, Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            const profile = await fetchProfile(currentSession.user.id);
            if (profile) {
              setProfile(profile as UserProfile);
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (mounted) {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            const profile = await fetchProfile(newSession.user.id);
            if (profile) {
              setProfile(profile as UserProfile);
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

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data: { session: refreshedSession }, error } = 
        await supabase.auth.refreshSession();
      
      if (error) throw error;

      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        const profile = await fetchProfile(refreshedSession.user.id);
        if (profile) {
          setProfile(profile as UserProfile);
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setError(error instanceof Error ? error : new Error('Session refresh failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading: isLoading && !isInitialized,
    error,
    signOut: async () => {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    },
    refreshProfile: async () => {
      if (user) {
        await fetchProfile(user.id);
      }
    },
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};