
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TurnstileCaptcha } from "@/components/auth/Turnstile";

interface SignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  username: string;
  setUsername: (username: string) => void;
  stayLoggedIn: boolean;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent, turnstileToken?: string) => Promise<void>;
  showTurnstile: boolean;
  validationErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  };
}

export const SignUpForm = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  username,
  setUsername,
  stayLoggedIn,
  setStayLoggedIn,
  loading,
  onSubmit,
  showTurnstile,
  validationErrors,
}: SignUpFormProps) => {
  return (
    <form onSubmit={(e) => onSubmit(e)} className="space-y-4 px-6 pb-6">
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
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-white/10"
        />
        {validationErrors?.username && (
          <p className="text-red-500 text-sm">{validationErrors.username}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white/10"
        />
        {validationErrors?.password && (
          <p className="text-red-500 text-sm">{validationErrors.password}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="bg-white/10"
        />
        {validationErrors?.confirmPassword && (
          <p className="text-red-500 text-sm">{validationErrors.confirmPassword}</p>
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
          <TurnstileCaptcha onVerify={(token) => onSubmit(new Event('submit') as any, token)} />
        </div>
      ) : (
        <Button
          type="submit"
          className="w-full bg-game-gold hover:bg-game-gold/90"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      )}
    </form>
  );
};
