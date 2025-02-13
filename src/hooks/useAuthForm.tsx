
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
      const { data: { user }, error } = await supabase.auth.signUp({
        email: `guest_${Date.now()}@temporary.com`,
        password: `guest${Date.now()}`,
        options: {
          data: {
            username: `Guest_${Date.now().toString(36)}`,
          },
        },
      });

      if (error) throw error;

      if (user) {
        const guestUsername = `Guest_${Date.now().toString(36)}`;
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
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
