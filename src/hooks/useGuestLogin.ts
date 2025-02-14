
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
      console.log('Fetching guest credentials...'); // Debug log

      const { data: guestCreds, error: guestCredsError } = await supabase
        .from('guest_credentials')
        .select('email, password')
        .order('last_used_at', { ascending: true, nullsFirst: true })
        .limit(1)
        .single();

      if (guestCredsError) {
        console.error('Error fetching guest credentials:', guestCredsError); // Debug log
        throw guestCredsError;
      }

      console.log('Found guest credentials, attempting login...', { email: guestCreds.email }); // Debug log

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestCreds.email,
        password: guestCreds.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError); // Debug log
        throw signInError;
      }

      if (data.user) {
        console.log('Guest login successful, updating last_used_at...'); // Debug log
        
        // Update the last used timestamp
        const { error: updateError } = await supabase
          .from('guest_credentials')
          .update({ last_used_at: new Date().toISOString() })
          .eq('email', guestCreds.email);

        if (updateError) {
          console.error('Error updating last_used_at:', updateError); // Debug log
        }

        toast.success('Logged in as guest!');
        navigate("/game", { replace: true });
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
