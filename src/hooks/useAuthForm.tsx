
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
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

        if (profileError) throw profileError;

        toast.success("Verification email sent! Please check your inbox.");
        toast.info("You'll need to verify your email before accessing all features.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ preferences: { stayLoggedIn } })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Error updating preferences:', updateError);
        }

        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const guestEmail = `guest_${Date.now()}@temporary.com`;
      const guestPassword = `guest${Date.now()}`;
      const guestUsername = `Guest_${Date.now().toString(36)}`;

      // First sign up the guest user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          data: {
            username: guestUsername,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Then sign in immediately to get a valid session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      });

      if (signInError) throw signInError;

      if (signInData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: signInData.user.id,
              username: guestUsername,
              is_guest: true,
              preferences: { stayLoggedIn: false },
              verified: false,
              email_verified: false,
            },
          ]);

        if (profileError) throw profileError;

        toast.success("Continuing as guest");
        navigate("/");
      }
    } catch (error: any) {
      toast.error("Failed to continue as guest. Please try again.");
      console.error('Guest login error:', error);
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
    handleGuestLogin,
  };
};
