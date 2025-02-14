
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting sign in with:', { email }); // Debug log

      // First sign out to clear any existing sessions
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error); // Debug log
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned after sign in');
      }

      console.log('Sign in successful:', data.user); // Debug log

      // Update preferences after successful sign in
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          preferences: { stayLoggedIn },
          last_login: new Date().toISOString()
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Failed to update preferences:', updateError);
      }

      toast.success("Signed in successfully!");
      console.log('Redirecting to game page...'); // Debug log
      navigate("/game", { replace: true });
    } catch (error: any) {
      console.error('Sign in error:', error); // Debug log
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting sign up:', { email, username }); // Debug log

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError); // Debug log
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No user data returned after sign up');
      }

      console.log('Sign up successful, creating profile...'); // Debug log

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username,
            preferences: { stayLoggedIn },
            is_guest: false,
            verified: false,
            email_verified: false,
          },
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError); // Debug log
        throw profileError;
      }

      toast.success("Sign up successful! Please check your email for verification.");
      toast.info("You'll need to verify your email before accessing all features.");
    } catch (error: any) {
      console.error('Sign up error:', error); // Debug log
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Sending magic link to:', email); // Debug log

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Magic link error:', error); // Debug log
        throw error;
      }

      toast.success("Magic link sent! Please check your email.");
    } catch (error: any) {
      console.error('Magic link error:', error); // Debug log
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    loading,
    stayLoggedIn,
    setStayLoggedIn,
    handleSignIn,
    handleSignUp,
    handleMagicLinkLogin,
  };
};
