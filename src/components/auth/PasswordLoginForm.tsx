import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TurnstileCaptcha } from "@/components/auth/Turnstile";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PasswordLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  stayLoggedIn: boolean;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent, turnstileToken?: string) => Promise<void>;
  showTurnstile: boolean;
  validationErrors?: {
    email?: string;
    password?: string;
  };
}

export const PasswordLoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  stayLoggedIn,
  setStayLoggedIn,
  loading,
  onSubmit,
  showTurnstile,
  validationErrors,
}: PasswordLoginFormProps) => {
  const [turnstileToken, setTurnstileToken] = useState<string>();
  const [resetEmail, setResetEmail] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password login form submitted', { email, turnstileToken });

    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await onSubmit(e, turnstileToken);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  const onTurnstileVerify = async (token: string) => {
    console.log('Turnstile verified, submitting form with token');
    setTurnstileToken(token);
    
    try {
      const form = document.createElement('form');
      const nativeEvent = new Event('submit', { bubbles: true, cancelable: true });
      
      // Create a proper React FormEvent
      const syntheticEvent: React.FormEvent<HTMLFormElement> = {
        nativeEvent,
        currentTarget: form,
        target: form,
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        preventDefault: () => {},
        isDefaultPrevented: () => false,
        stopPropagation: () => {},
        isPropagationStopped: () => false,
        persist: () => {},
        isTrusted: true,
        timeStamp: Date.now(),
        type: 'submit',
        eventPhase: nativeEvent.eventPhase
      };

      await onSubmit(syntheticEvent, token);
    } catch (error) {
      console.error('Login error after Turnstile:', error);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions sent to your email');
      setResetDialogOpen(false);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset password email');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/10"
        />
        {validationErrors?.email && (
          <p className="text-red-500 text-sm">{validationErrors.email}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white/10"
        />
        {validationErrors?.password && (
          <p className="text-red-500 text-sm">{validationErrors.password}</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="stayLoggedIn"
            checked={stayLoggedIn}
            onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
          />
          <Label htmlFor="stayLoggedIn" className="text-sm">Stay logged in</Label>
        </div>
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="link"
              className="text-sm text-yellow-400 hover:text-yellow-300"
              type="button"
            >
              Forgot password?
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <Button
                type="button"
                onClick={handleResetPassword}
                className="w-full bg-game-gold hover:bg-game-gold/90"
              >
                Send Reset Instructions
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showTurnstile ? (
        <div className="flex justify-center">
          <TurnstileCaptcha onVerify={onTurnstileVerify} />
        </div>
      ) : (
        <Button 
          type="submit" 
          className="w-full bg-game-gold hover:bg-game-gold/90"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      )}
    </form>
  );
};
