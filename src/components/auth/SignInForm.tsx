
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  onGuestLogin: () => Promise<void>;
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
  onGuestLogin,
}: SignInFormProps) => {
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
              variant="outline"
              onClick={onGuestLogin}
              disabled={loading}
              className="w-full"
            >
              Continue as Guest
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
              variant="outline"
              onClick={onGuestLogin}
              disabled={loading}
              className="w-full"
            >
              Continue as Guest
            </Button>
          </CardFooter>
        </form>
      </TabsContent>
    </Tabs>
  );
};
