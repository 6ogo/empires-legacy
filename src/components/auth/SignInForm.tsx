
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  stayLoggedIn: boolean;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onMagicLinkLogin: (e: React.FormEvent) => Promise<void>;
}

export const SignInForm = ({
  email,
  setEmail,
  password,
  setPassword,
  stayLoggedIn,
  setStayLoggedIn,
  loading,
  onSubmit,
  onMagicLinkLogin,
}: SignInFormProps) => {
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    try {
      setIsGuestLoading(true);
      
      // Create a temporary email and password for the guest user
      const tempEmail = `guest_${Date.now()}@temporary.com`;
      const tempPassword = `temp_${Date.now()}`;

      const { data, error } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            is_guest: true
          },
          emailRedirectTo: undefined // Disable email verification for guests
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create guest profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: `Guest_${Date.now().toString(36)}`,
              is_guest: true,
              verified: false,
              email_verified: false,
              preferences: { stayLoggedIn: false }
            }
          ]);

        if (profileError) throw profileError;
        
        toast.success("Logged in as guest!");
        navigate("/game");
      }
    } catch (error: any) {
      console.error('Guest login error:', error);
      toast.error(error.message || 'Failed to login as guest');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <Tabs defaultValue="password" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
      </TabsList>

      <TabsContent value="password">
        <form onSubmit={onSubmit}>
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
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stay-logged-in"
                checked={stayLoggedIn}
                onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
              />
              <Label htmlFor="stay-logged-in" className="text-sm">Stay logged in</Label>
            </div>
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
            <Button
              type="button"
              variant="secondary"
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
              className="w-full text-white bg-white/20 hover:bg-white/30"
            >
              {isGuestLoading ? "Joining as Guest..." : "Continue as Guest"}
            </Button>
          </CardFooter>
        </form>
      </TabsContent>

      <TabsContent value="magic-link">
        <form onSubmit={onMagicLinkLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-link-email">Email</Label>
              <Input
                id="magic-link-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-game-gold hover:bg-game-gold/90"
              disabled={loading}
            >
              {loading ? "Sending link..." : "Send Magic Link"}
            </Button>
            <Separator className="my-2" />
            <Button
              type="button"
              variant="secondary"
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
              className="w-full text-white bg-white/20 hover:bg-white/30"
            >
              {isGuestLoading ? "Joining as Guest..." : "Continue as Guest"}
            </Button>
          </CardFooter>
        </form>
      </TabsContent>
    </Tabs>
  );
};
