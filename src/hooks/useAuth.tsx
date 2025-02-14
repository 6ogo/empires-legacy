
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const transformedProfile: UserProfile = {
          id: data.id,
          username: data.username,
          verified: !!data.verified,
          email_verified: !!data.email_verified,
          preferences: typeof data.preferences === 'string' 
            ? JSON.parse(data.preferences)
            : (data.preferences as { stayLoggedIn: boolean }) ?? { stayLoggedIn: false },
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          total_gametime: data.total_gametime || 0,
          total_games_played: data.total_games_played || 0,
          total_wins: data.total_wins || 0,
          economic_wins: data.economic_wins || 0,
          domination_wins: data.domination_wins || 0,
          xp: data.xp || 0,
          level: data.level || 1,
          last_username_change: data.last_username_change,
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
        };
        return transformedProfile;
      }
      return null;
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      toast.error('Failed to load profile data');
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('Auth hook initializing...'); // Debug log
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check result:', session ? 'Session found' : 'No session'); // Debug log

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        toast.error('Failed to initialize authentication');
      } finally {
        if (mounted) {
          // Set loading to false regardless of whether we found a session or not
          setLoading(false);
        }
      }
    };

    // Initialize auth state immediately
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session'); // Debug log
      
      if (!mounted) return;

      // Temporarily set loading to true during auth state change
      setLoading(true);

      try {
        if (session?.user) {
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setProfile(null);
      setUser(null);
      toast.success('Signed out successfully');
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
