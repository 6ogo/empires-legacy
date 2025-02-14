
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useGuestLogin = () => {
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const navigate = useNavigate();

  const handleGuestLogin = async (turnstileToken?: string) => {
    if (!turnstileToken) {
      setShowTurnstile(true);
      return;
    }

    try {
      setIsGuestLoading(true);

      const { data: guestCreds, error: guestCredsError } = await supabase
        .from('guest_credentials')
        .select('email, password')
        .order('last_used_at', { ascending: true, nullsFirst: true })
        .limit(1)
        .maybeSingle();

      if (guestCredsError) throw guestCredsError;
      
      if (!guestCreds) {
        throw new Error('No guest credentials available');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: guestCreds.email,
        password: guestCreds.password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: data.user.id,
            username: `Guest_${Date.now().toString(36)}`,
            is_guest: true,
            turnstile_verified: true,
            email_verified: false,
            verified: false,
            preferences: { stayLoggedIn: false }
          }], {
            onConflict: 'id'
          });

        if (profileError) throw profileError;

        await supabase
          .from('guest_credentials')
          .update({ last_used_at: new Date().toISOString() })
          .eq('email', guestCreds.email);
        
        toast.success("Logged in as guest!");
        navigate("/game");
      }
    } catch (error: any) {
      console.error('Guest login error:', error);
      toast.error(error.message || 'Failed to login as guest');
    } finally {
      setIsGuestLoading(false);
      setShowTurnstile(false);
    }
  };

  return {
    isGuestLoading,
    showTurnstile,
    setShowTurnstile,
    handleGuestLogin
  };
};
