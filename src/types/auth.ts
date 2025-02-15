
import { Database } from '@/integrations/supabase/types';
import { User, Session } from '@supabase/supabase-js';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  xp?: number;
  level?: number;
  verified?: boolean;
  email_verified?: boolean;
  preferences?: { 
    stayLoggedIn: boolean;
    theme?: 'light' | 'dark';
    notifications?: {
      email: boolean;
      push: boolean;
    };
  };
  total_gametime?: number;
  total_games_played?: number;
  total_wins?: number;
  economic_wins?: number;
  domination_wins?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}
