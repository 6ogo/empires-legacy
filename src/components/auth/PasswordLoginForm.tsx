
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TurnstileCaptcha } from "@/components/auth/Turnstile";
import { toast } from "sonner";

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

  const onTurnstileVerify = (token: string) => {
    console.log('Turnstile verified, submitting form with token');
    setTurnstileToken(token);
    
    // Create a real Event object
    const nativeEvent = new Event('submit', {
      bubbles: true,
      cancelable: true
    });

    // Create a proper React FormEvent
    const syntheticEvent: React.FormEvent<HTMLFormElement> = Object.assign(
      new Event('submit', { bubbles: true, cancelable: true }), {
        target: document.createElement('form'),
        currentTarget: document.createElement('form'),
        nativeEvent,
        preventDefault: () => {},
        isDefaultPrevented: () => false,
        stopPropagation: () => {},
        isPropagationStopped: () => false,
        persist: () => {},
        timeStamp: Date.now(),
        type: 'submit',
        eventPhase: 2, // Bubbling phase
      }
    ) as unknown as React.FormEvent<HTMLFormElement>;

    // Call onSubmit with the properly typed event
    onSubmit(syntheticEvent, token);
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
      <div className="flex items-center space-x-2">
        <Checkbox
          id="stayLoggedIn"
          checked={stayLoggedIn}
          onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
        />
        <Label htmlFor="stayLoggedIn" className="text-sm">Stay logged in</Label>
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
