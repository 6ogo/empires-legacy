
import { Database } from '@/integrations/supabase/types';
import { User, Session } from '@supabase/supabase-js';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}
