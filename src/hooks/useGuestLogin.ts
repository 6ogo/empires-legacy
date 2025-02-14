
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGuestLogin = () => {
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);

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
        .single();

      if (guestCredsError) {
        throw guestCredsError;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: guestCreds.email,
        password: guestCreds.password,
      });

      if (signInError) throw signInError;

      // Update the last used timestamp
      await supabase
        .from('guest_credentials')
        .update({ last_used_at: new Date().toISOString() })
        .eq('email', guestCreds.email);

      toast.success('Logged in as guest!');
    } catch (error: any) {
      console.error('Guest login error:', error);
      toast.error('Failed to login as guest');
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
