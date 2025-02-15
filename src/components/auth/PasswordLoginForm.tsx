
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { GuestLoginButton } from "./GuestLoginButton";
import { TurnstileCaptcha } from "./Turnstile";
import React, { useState } from "react";

interface PasswordLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  stayLoggedIn: boolean;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent, turnstileToken?: string) => Promise<void>;
  showTurnstile?: boolean;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, turnstileToken);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
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
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
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
            id="stay-logged-in"
            checked={stayLoggedIn}
            onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
          />
          <Label htmlFor="stay-logged-in" className="text-sm">Stay logged in</Label>
        </div>
        {showTurnstile && (
          <div className="flex justify-center">
            <TurnstileCaptcha onVerify={setTurnstileToken} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button 
          type="submit" 
          className="w-full bg-game-gold hover:bg-game-gold/90"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <Separator className="my-2" />
        <GuestLoginButton />
      </CardFooter>
    </form>
  );
};
