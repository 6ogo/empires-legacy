
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
  const [formState, setFormState] = useState<AuthFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    stayLoggedIn: false,
    loading: false,
    showTurnstile: false,
    validationErrors: {},
  });

  // Input validation
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
      
      if (typeof value === 'string' && ['email', 'password', 'confirmPassword', 'username'].includes(field)) {
        const error = validateInput(value, field as 'email' | 'password' | 'confirmPassword' | 'username');
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
    console.log('Handling sign in...', { email: formState.email, turnstileToken });

    // Validate email and password
    const emailError = validateInput(formState.email, 'email');
    const passwordError = validateInput(formState.password, 'password');

    if (emailError || passwordError) {
      setFormState(prev => ({
        ...prev,
        validationErrors: {
          email: emailError,
          password: passwordError
        }
      }));
      return;
    }

    if (!turnstileToken) {
      console.log('No turnstile token, showing captcha');
      setFormState(prev => ({ ...prev, showTurnstile: true }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formState.email.trim(),
        password: formState.password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No user data returned after sign in');
      }

      // Update profile with login info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          last_login: new Date().toISOString(),
          turnstile_verified: true,
          preferences: { stayLoggedIn: formState.stayLoggedIn }
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
      }

      console.log('Sign in successful, navigating to game');
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

    // Validate all fields
    const emailError = validateInput(formState.email, 'email');
    const passwordError = validateInput(formState.password, 'password');
    const confirmPasswordError = validateInput(formState.confirmPassword, 'confirmPassword');
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

    if (formState.password !== formState.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!turnstileToken) {
      console.log('No turnstile token, showing captcha');
      setFormState(prev => ({ ...prev, showTurnstile: true }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      // Check if email exists
      const { data: emailExists } = await supabase.rpc('check_email_exists', {
        email_to_check: formState.email
      });

      if (emailExists) {
        toast.error('Email is already registered');
        return;
      }

      // Check if username exists
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

      // Create profile
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

      toast.success("Account created successfully! Check your email for verification.");
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
  };
};
