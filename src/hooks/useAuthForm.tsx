import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  stayLoggedIn: boolean;
  loading: boolean;
  showTurnstile: boolean;
  validationErrors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  };
}

export const useAuthForm = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    stayLoggedIn: false,
    loading: false,
    showTurnstile: false,
    validationErrors: {},
  });

  const validateInput = useCallback((input: string, type: 'email' | 'username' | 'password' | 'confirmPassword'): string | null => {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? null : 'Invalid email format';
      case 'username':
        return /^[a-zA-Z0-9_]{3,20}$/.test(input) ? null : 'Username must be 3-20 characters';
      case 'password':
        return input.length >= 6 ? null : 'Password must be at least 6 characters';
      case 'confirmPassword':
        return input === formState.password ? null : 'Passwords do not match';
      default:
        return null;
    }
  }, [formState.password]);

  const updateFormState = useCallback((field: keyof AuthFormState, value: string | boolean) => {
    setFormState(prev => {
      const newState = { ...prev, [field]: value };
      
      if (field === 'password' || field === 'confirmPassword') {
        if (field === 'password') {
          newState.validationErrors = {
            ...prev.validationErrors,
            confirmPassword: newState.confirmPassword ? 
              (newState.confirmPassword === value ? null : 'Passwords do not match') : 
              null
          };
        } else {
          newState.validationErrors = {
            ...prev.validationErrors,
            confirmPassword: value === newState.password ? null : 'Passwords do not match'
          };
        }
      }
      
      if (typeof value === 'string' && ['email', 'username'].includes(field)) {
        const error = validateInput(value, field as 'email' | 'username');
        newState.validationErrors = {
          ...newState.validationErrors,
          [field]: error
        };
      }
      
      return newState;
    });
  }, [validateInput]);

  const handleSignIn = async (e: React.FormEvent, turnstileToken?: string) => {
    e.preventDefault();
    console.log('Handling sign in...', { email: formState.email, turnstileToken });
  
    if (!formState.email || !formState.password) {
      toast.error('Please fill in all required fields');
      return;
    }
  
    if (!turnstileToken) {
      setFormState(prev => ({ ...prev, showTurnstile: true }));
      return;
    }
  
    setFormState(prev => ({ ...prev, loading: true }));
  
    try {
      // Attempt sign in first - if it fails, we don't need to verify turnstile
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formState.email.trim(),
        password: formState.password,
      });
  
      if (error) throw error;
  
      if (!data.user) {
        throw new Error('No user data returned after sign in');
      }

      // Only verify turnstile after successful sign in
      try {
        const verifyResponse = await fetch('/api/turnstile/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken }),
        });

        if (!verifyResponse.ok) {
          // If verification fails, sign out and throw error
          await supabase.auth.signOut();
          throw new Error('Security verification failed');
        }
      } catch (verifyError) {
        // If verification request fails, still allow sign in but log the error
        console.error('Turnstile verification error:', verifyError);
      }

      // Wait a moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));
  
      // Update profile with new login timestamp
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          last_login: new Date().toISOString(),
          turnstile_verified: true,
        })
        .eq('id', data.user.id);
  
      if (updateError) {
        console.error('Failed to update profile:', updateError);
      }
  
      toast.success("Signed in successfully!");
      navigate('/game', { replace: true });
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
    console.log('Handling sign up...', { 
      email: formState.email, 
      username: formState.username, 
      turnstileToken,
      showTurnstile: formState.showTurnstile 
    });

    const emailError = validateInput(formState.email, 'email');
    const passwordError = validateInput(formState.password, 'password');
    const confirmPasswordError = formState.password !== formState.confirmPassword ? 'Passwords do not match' : null;
    const usernameError = validateInput(formState.username, 'username');

    if (emailError || passwordError || confirmPasswordError || usernameError) {
      setFormState(prev => ({
        ...prev,
        validationErrors: {
          email: emailError,
          password: passwordError,
          confirmPassword: confirmPasswordError,
          username: usernameError
        }
      }));
      toast.error('Please fix the validation errors');
      return;
    }

    if (!turnstileToken) {
      console.log('No turnstile token, showing captcha');
      setFormState(prev => ({ ...prev, showTurnstile: true }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      const { data: emailExists } = await supabase.rpc('check_email_exists', {
        email_to_check: formState.email
      });

      if (emailExists) {
        toast.error('Email is already registered');
        return;
      }

      const { data: usernameExists } = await supabase.rpc('check_username_exists', {
        username_to_check: formState.username
      });

      if (usernameExists) {
        toast.error('Username is already taken');
        return;
      }

      console.log('Attempting to create account...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formState.email.trim(),
        password: formState.password,
        options: {
          data: {
            username: formState.username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('No user data returned after sign up');
      }

      console.log('Account created, creating profile...');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          username: formState.username,
          preferences: { stayLoggedIn: formState.stayLoggedIn },
          is_guest: false,
          verified: false,
          email_verified: false,
          turnstile_verified: true
        }]);

      if (profileError) {
        if (profileError.code === '23505') { // Unique constraint violation
          toast.error('Username is already taken');
          return;
        }
        throw profileError;
      }

      toast.success("Account created! Please check your email for verification.");
      console.log('Sign up successful, navigating to game');
      navigate('/game', { replace: true });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      setFormState(prev => ({ ...prev, showTurnstile: false }));
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset password email');
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handling magic link login...', { email: formState.email });

    const emailError = validateInput(formState.email, 'email');
    if (emailError) {
      setFormState(prev => ({
        ...prev,
        validationErrors: { email: emailError }
      }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formState.email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success("Magic link sent! Check your email.");
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
    setConfirmPassword: (confirmPassword: string) => updateFormState('confirmPassword', confirmPassword),
    setUsername: (username: string) => updateFormState('username', username),
    setStayLoggedIn: (stayLoggedIn: boolean) => updateFormState('stayLoggedIn', stayLoggedIn),
    setShowTurnstile: (show: boolean) => updateFormState('showTurnstile', show),
    handleSignIn,
    handleSignUp,
    handleResetPassword,
    handleMagicLinkLogin,
  };
};