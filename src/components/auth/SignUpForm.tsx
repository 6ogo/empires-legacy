
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { TurnstileCaptcha } from "./Turnstile";
import React from "react";

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
  showTurnstile?: boolean;
  onGuestLogin?: () => Promise<void>;
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
  showTurnstile,
  onGuestLogin,
}: SignUpFormProps) => {
  // Create a synthetic form event
  const createFormEvent = () => {
    const event = new Event('submit', { bubbles: true, cancelable: true });
    return event as unknown as React.FormEvent;
  };

  return (
    <form onSubmit={(e) => onSubmit(e)}>
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
          />
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
          />
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
          />
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
            <TurnstileCaptcha onSuccess={(token) => onSubmit(createFormEvent(), token)} />
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
        {onGuestLogin && (
          <>
            <Separator className="my-2" />
            <Button
              type="button"
              variant="outline"
              onClick={onGuestLogin}
              disabled={loading}
              className="w-full"
            >
              Continue as Guest
            </Button>
          </>
        )}
      </CardFooter>
    </form>
  );
};
