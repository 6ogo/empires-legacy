import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Transform the data to match UserProfile type
        const transformedProfile: UserProfile = {
          id: data.id,
          username: data.username,
          verified: data.verified,
          email_verified: data.email_verified,
          preferences: typeof data.preferences === 'string' 
            ? JSON.parse(data.preferences)
            : data.preferences,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          total_gametime: data.total_gametime,
          total_games_played: data.total_games_played,
          total_wins: data.total_wins,
          economic_wins: data.economic_wins,
          domination_wins: data.domination_wins,
          xp: data.xp,
          level: data.level,
          last_username_change: data.last_username_change,
          achievements: data.achievements,
        };

        setProfile(transformedProfile);
      } else {
        // Handle case where profile doesn't exist
        console.log('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    signOut,
  };
};
