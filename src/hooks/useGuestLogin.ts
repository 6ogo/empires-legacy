
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
      console.log('No turnstile token, showing captcha...'); // Debug log
      setShowTurnstile(true);
      return;
    }

    try {
      setIsGuestLoading(true);
      console.log('Fetching guest credentials with turnstile token...', turnstileToken); // Debug log

      const { data: guestCreds, error: guestCredsError } = await supabase
        .from('guest_credentials')
        .select('email, password')
        .order('last_used_at', { ascending: true, nullsFirst: true })
        .limit(1)
        .maybeSingle();

      if (guestCredsError) {
        console.error('Error fetching guest credentials:', guestCredsError);
        throw new Error('Failed to fetch guest credentials');
      }

      if (!guestCreds) {
        throw new Error('No guest accounts available');
      }

      console.log('Found guest credentials, attempting login...'); // Debug log

      // First, sign out any existing session
      await supabase.auth.signOut();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestCreds.email,
        password: guestCreds.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (!data.user) {
        throw new Error('Failed to create guest session');
      }

      console.log('Guest login successful, updating timestamps...'); // Debug log

      // Update last used timestamp
      const { error: updateError } = await supabase
        .from('guest_credentials')
        .update({ last_used_at: new Date().toISOString() })
        .eq('email', guestCreds.email);

      if (updateError) {
        console.error('Error updating last_used_at:', updateError);
      }

      // Update turnstile verification in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          turnstile_verified: true,
          last_login: new Date().toISOString()
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      toast.success('Logged in as guest successfully!');
      
      // Force navigation after successful login
      console.log('Redirecting to game page...'); // Debug log
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
