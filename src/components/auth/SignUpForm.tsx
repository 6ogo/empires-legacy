import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { TurnstileCaptcha } from "./Turnstile";
import { useState } from "react";

interface SignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  username: string;
  setUsername: (username: string) => void;
  stayLoggedIn: boolean;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent, turnstileToken?: string) => Promise<void>;
}

export const SignUpForm = ({
  email,
  setEmail,
  password,
  setPassword,
  username,
  setUsername,
  stayLoggedIn,
  setStayLoggedIn,
  loading,
  onSubmit,
}: SignUpFormProps) => {
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }
    
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, turnstileToken?: string) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!turnstileToken) {
      setShowTurnstile(true);
      return;
    }

    try {
      await onSubmit(e, turnstileToken);
    } catch (error) {
      console.error('Sign up failed:', error);
    } finally {
      setShowTurnstile(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10"
            aria-invalid={!!validationErrors.email}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            className="bg-white/10"
            aria-invalid={!!validationErrors.username}
          />
          {validationErrors.username && (
            <p className="text-sm text-red-500">{validationErrors.username}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-white/10"
            aria-invalid={!!validationErrors.password}
          />
          {validationErrors.password && (
            <p className="text-sm text-red-500">{validationErrors.password}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="stay-logged-in-signup"
            checked={stayLoggedIn}
            onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
          />
          <Label htmlFor="stay-logged-in-signup" className="text-sm">Stay logged in</Label>
        </div>
        {showTurnstile && (
          <div className="flex justify-center">
            <TurnstileCaptcha onSuccess={(token) => handleSubmit(new Event('submit') as React.FormEvent, token)} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button 
          type="submit" 
          className="w-full bg-game-gold hover:bg-game-gold/90"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </CardFooter>
    </form>
  );
};
