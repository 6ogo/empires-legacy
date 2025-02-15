
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "./useSession";
import type { UserProfile, AuthContextType } from "@/types/auth";

export type { UserProfile, AuthContextType };

export const useAuth = () => {
  const { user, profile, loading: isLoading } = useSession();

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Successfully signed out');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return {
    user,
    profile,
    isLoading,
    signOut,
  };
};
