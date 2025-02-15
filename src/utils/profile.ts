
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log('Fetching profile for user:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No profile found for user:', userId);
      return null;
    }

    console.log('Profile fetched successfully:', data);
    return {
      id: data.id,
      username: data.username || undefined,
      verified: !!data.verified,
      email_verified: !!data.email_verified,
      preferences: data.preferences as { stayLoggedIn: boolean } ?? { stayLoggedIn: false },
      avatarUrl: data.avatar_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.created_at,
      lastLoginAt: data.last_login || undefined,
      total_gametime: data.total_gametime || 0,
      total_games_played: data.total_games_played || 0,
      total_wins: data.total_wins || 0,
      economic_wins: data.economic_wins || 0,
      domination_wins: data.domination_wins || 0,
      xp: data.xp || 0,
      level: data.level || 1
    };
  } catch (error: any) {
    console.error('Error in fetchProfile:', error);
    throw error;
  }
};
