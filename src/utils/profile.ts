
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { Database } from "@/integrations/supabase/types";

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

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

    // Type assertion for preferences
    const preferencesData = data.preferences as { 
      stayLoggedIn?: boolean; 
      theme?: 'light' | 'dark';
      notifications?: { 
        email: boolean; 
        push: boolean; 
      };
    } | null;

    // Create preferences object with default values
    const preferences = {
      stayLoggedIn: preferencesData?.stayLoggedIn ?? false,
      theme: preferencesData?.theme,
      notifications: {
        email: preferencesData?.notifications?.email ?? false,
        push: preferencesData?.notifications?.push ?? false
      }
    };

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
