
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  username: string | null;
  verified: boolean;
  email_verified: boolean;
  preferences: {
    stayLoggedIn: boolean;
  };
  avatar_url: string | null;
  created_at: string;
  last_login: string | null;
  total_gametime: number;
  total_games_played: number;
  total_wins: number;
  economic_wins: number;
  domination_wins: number;
  xp: number;
  level: number;
  last_username_change: string | null;
  achievements: Json[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('Fetching profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return {
        id: data.id,
        username: data.username,
        verified: !!data.verified,
        email_verified: !!data.email_verified,
        preferences: data.preferences as { stayLoggedIn: boolean } ?? { stayLoggedIn: false },
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        last_login: data.last_login,
        total_gametime: data.total_gametime || 0,
        total_games_played: data.total_games_played || 0,
        total_wins: data.total_wins || 0,
        economic_wins: data.economic_wins || 0,
        domination_wins: data.domination_wins || 0,
        xp: data.xp || 0,
        level: data.level || 1,
        last_username_change: data.last_username_change,
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
      } as UserProfile;
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('Initializing auth...');
      setLoading(true); // Ensure loading is true at start

      try {
        // First, try to get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        // Guard against component unmount
        if (!mounted) {
          console.log('Component unmounted during auth initialization');
          return;
        }

        console.log('Session state:', session ? 'Valid session' : 'No session');

        if (session?.user) {
          console.log('Setting user from session:', session.user.email);
          setUser(session.user);
          
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            if (profile) {
              console.log('Setting profile for user');
              setProfile(profile);
            } else {
              console.log('No profile found for user');
              // If no profile, treat as not authenticated
              setUser(null);
            }
          }
        } else {
          console.log('No session found, clearing user and profile');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        // Clear auth state on error
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
        toast.error('Authentication error. Please try again.');
      } finally {
        // Always set loading to false if component is still mounted
        if (mounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (!mounted) {
        console.log('Component unmounted during auth state change');
        return;
      }

      try {
        if (session?.user) {
          console.log('Auth state change: User found');
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          
          if (mounted) {
            if (profile) {
              console.log('Auth state change: Setting profile');
              setProfile(profile);
            } else {
              console.log('Auth state change: No profile found');
              setUser(null);
              setProfile(null);
            }
          }
        } else {
          console.log('Auth state change: No user');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('Auth state change: Setting loading to false');
          setLoading(false);
        }
      }
    });

    // Initialize auth after setting up listener
    initializeAuth();

    // Cleanup function
    return () => {
      console.log('Cleaning up auth effect');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      
      console.log('Successfully signed out');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
  };
};
