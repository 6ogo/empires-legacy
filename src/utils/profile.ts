
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log('Fetching profile for user:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No profile found for user:', userId);
      return null;
    }

    // Parse preferences with default values if needed
    const preferences = typeof data.preferences === 'object' && data.preferences !== null
      ? {
          stayLoggedIn: Boolean(data.preferences?.stayLoggedIn),
          theme: data.preferences?.theme as 'light' | 'dark' | undefined,
          notifications: {
            email: Boolean(data.preferences?.notifications?.email),
            push: Boolean(data.preferences?.notifications?.push)
          }
        }
      : { stayLoggedIn: false };

    console.log('Profile fetched successfully:', data);
    return {
      id: data.id,
      username: data.username || undefined,
      verified: !!data.verified,
      email_verified: !!data.email_verified,
      preferences,
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
  } catch (error: any) {
    console.error('Error in fetchProfile:', error);
    throw error;
  }
};
