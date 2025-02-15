
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from "@/types/auth";
import { fetchProfile } from "@/utils/profile";

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('Initializing auth...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        if (!mounted) return;

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
              setUser(null);
            }
          }
        } else {
          if (mounted) {
            console.log('No session found, clearing user and profile');
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          toast.error('Authentication error. Please try again.');
        }
      } finally {
        if (mounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (!mounted) return;

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
          if (mounted) {
            console.log('Auth state change: No user');
            setUser(null);
            setProfile(null);
          }
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

    return () => {
      console.log('Cleaning up session effect');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
};
