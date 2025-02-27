// src/utils/profile.ts
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

/**
 * Fetches a user profile from Supabase
 * @param userId The ID of the user whose profile to fetch
 * @returns The user profile or null if not found
 */
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

    // Handle potentially missing or malformed preferences
    let preferences;
    try {
      if (typeof data.preferences === 'string') {
        preferences = JSON.parse(data.preferences);
      } else {
        preferences = data.preferences || {};
      }
    } catch (e) {
      console.warn('Could not parse preferences, using defaults');
      preferences = {};
    }

    // Create a normalized preferences object with default values
    const normalizedPreferences = {
      stayLoggedIn: preferences?.stayLoggedIn ?? false,
      theme: preferences?.theme || 'dark',
      notifications: {
        email: preferences?.notifications?.email ?? false,
        push: preferences?.notifications?.push ?? false
      }
    };

    // Convert numeric fields with nullish coalescing
    const profile: UserProfile = {
      id: data.id,
      username: data.username || undefined,
      verified: !!data.verified,
      email_verified: !!data.email_verified,
      preferences: normalizedPreferences,
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

    console.log('Profile fetched successfully');
    return profile;
  } catch (error: any) {
    console.error('Error in fetchProfile:', error);
    throw error;
  }
};

/**
 * Updates a user profile in Supabase
 * @param userId The ID of the user whose profile to update
 * @param profileData The profile data to update
 * @returns Success or error
 */
export const updateProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<boolean> => {
  try {
    // Format the data for the supabase table
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return false;
  }
};