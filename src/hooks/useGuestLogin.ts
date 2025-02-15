
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useGuestLogin = () => {
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const navigate = useNavigate();

  const handleGuestLogin = async (turnstileToken?: string) => {
    console.log('Handling guest login...', { turnstileToken });
    
    if (!turnstileToken) {
      setShowTurnstile(true);
      return;
    }

    setIsGuestLoading(true);

    try {
      // First ensure any existing session is cleared
      await supabase.auth.signOut();

      // Get available guest credentials
      const { data: guestCreds, error: guestCredsError } = await supabase
        .from('guest_credentials')
        .select('email, password')
        .eq('last_used_at', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (guestCredsError || !guestCreds) {
        throw new Error('No guest accounts available. Please try again later.');
      }

      console.log('Found available guest credentials');

      // Mark credentials as in use
      const { error: updateError } = await supabase
        .from('guest_credentials')
        .update({ last_used_at: new Date().toISOString() })
        .eq('email', guestCreds.email);

      if (updateError) {
        throw new Error('Failed to secure guest account. Please try again.');
      }

      // Sign in with guest credentials
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestCreds.email,
        password: guestCreds.password,
      });

      if (signInError || !data.user) {
        // Release the credentials if sign in fails
        await supabase
          .from('guest_credentials')
          .update({ last_used_at: null })
          .eq('email', guestCreds.email);
          
        throw signInError || new Error('Failed to create guest session');
      }

      // Update profile with turnstile verification
      await supabase
        .from('profiles')
        .update({ 
          turnstile_verified: true,
          last_login: new Date().toISOString()
        })
        .eq('id', data.user.id);

      toast.success('Logged in as guest successfully!');
      console.log('Guest login successful, navigating to game');
      navigate("/game", { replace: true });
    } catch (error: any) {
      console.error('Guest login error:', error);
      toast.error(error.message || 'Failed to login as guest');
      setShowTurnstile(false);
    } finally {
      setIsGuestLoading(false);
    }
  };

  return {
    isGuestLoading,
    showTurnstile,
    setShowTurnstile,
    handleGuestLogin
  };
};
