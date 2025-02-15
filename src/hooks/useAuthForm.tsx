import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthFormState {
  email: string;
  password: string;
  username: string;
  stayLoggedIn: boolean;
  loading: boolean;
  showTurnstile: boolean;
  validationErrors: {
    email?: string;
    password?: string;
    username?: string;
  };
}

interface UseAuthFormOptions {
  redirectPath?: string;
  requireVerification?: boolean;
}

export const useAuthForm = (options: UseAuthFormOptions = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formState, setFormState] = useState<AuthFormState>({
    email: "",
    password: "",
    username: "",
    stayLoggedIn: false,
    loading: false,
    showTurnstile: false,
    validationErrors: {},
  });

  // Input validation functions
  const validateInput = useCallback((
    input: string, 
    type: 'email' | 'username' | 'password'
  ): string | null => {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) 
          ? null 
          : 'Invalid email format';
      case 'username':
        return /^[a-zA-Z0-9_]{3,20}$/.test(input) 
          ? null 
          : 'Username must be 3-20 characters';
      case 'password':
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(input)
          ? null
          : 'Password must be at least 8 characters with letters and numbers';
      default:
        return null;
    }
  }, []);

  // Update form state with validation
  const updateFormState = useCallback((
    field: keyof AuthFormState,
    value: string | boolean
  ) => {
    setFormState(prev => {
      const newState = { ...prev, [field]: value };
      
      // Validate input fields
      if (typeof value === 'string' && ['email', 'password', 'username'].includes(field)) {
        const error = validateInput(value, field as 'email' | 'password' | 'username');
        newState.validationErrors = {
          ...prev.validationErrors,
          [field]: error
        };
      }
      
      return newState;
    });
  }, [validateInput]);

  const handleSignIn = async (e: React.FormEvent, turnstileToken?: string) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      setFormState(prev => ({ ...prev, showTurnstile: true }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      // First sign out to clear any existing sessions
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formState.email.trim(),
        password: formState.password,
        options: {
          captchaToken: turnstileToken
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No user data returned after sign in');
      }

      // Update preferences after successful sign in
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          preferences: { stayLoggedIn: formState.stayLoggedIn },
          last_login: new Date().toISOString(),
          turnstile_verified: true
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Failed to update preferences:', updateError);
      }

      setFormState(prev => ({ ...prev, showTurnstile: false }));
      toast.success("Signed in successfully!");

      // Navigate to the intended URL or default
      const redirectTo = location.state?.from || options.redirectPath || '/game';
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      setFormState(prev => ({ ...prev, showTurnstile: false }));
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSignUp = async (e: React.FormEvent, turnstileToken?: string) => {
    e.preventDefault();

    // Validate all fields before submission
    const errors = {
      email: validateInput(formState.email, 'email'),
      password: validateInput(formState.password, 'password'),
      username: validateInput(formState.username, 'username')
    };

    if (Object.values(errors).some(error => error !== null)) {
      setFormState(prev => ({
        ...prev,
        validationErrors: errors as Record<string, string>
      }));
      return;
    }

    if (!turnstileToken) {
      setFormState(prev => ({ ...prev, showTurnstile: true }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formState.email.trim(),
        password: formState.password,
        options: {
          data: {
            username: formState.username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken: turnstileToken
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('No user data returned after sign up');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username: formState.username,
            preferences: { stayLoggedIn: formState.stayLoggedIn },
            is_guest: false,
            verified: false,
            email_verified: false,
            turnstile_verified: true
          },
        ]);

      if (profileError) throw profileError;

      setFormState(prev => ({ ...prev, showTurnstile: false }));
      toast.success("Sign up successful! Please check your email for verification.");
      
      if (options.requireVerification) {
        toast.info("You'll need to verify your email before accessing all features.");
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
      setFormState(prev => ({ ...prev, showTurnstile: false }));
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formState.email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success("Magic link sent! Please check your email.");
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    ...formState,
    setEmail: (email: string) => updateFormState('email', email),
    setPassword: (password: string) => updateFormState('password', password),
    setUsername: (username: string) => updateFormState('username', username),
    setStayLoggedIn: (stayLoggedIn: boolean) => updateFormState('stayLoggedIn', stayLoggedIn),
    handleSignIn,
    handleSignUp,
    handleMagicLinkLogin,
  };
};
