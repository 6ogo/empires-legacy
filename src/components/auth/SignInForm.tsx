import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordLoginForm } from "./PasswordLoginForm";
import { MagicLinkForm } from "./MagicLinkForm";
import { useState } from "react";

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  stayLoggedIn: boolean;
  setStayLoggedIn: (stayLoggedIn: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent, turnstileToken?: string) => Promise<void>;
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
  const [activeTab, setActiveTab] = useState<string>("password");
  const [showTurnstile, setShowTurnstile] = useState(false);

  const handleSubmit = async (e: React.FormEvent, turnstileToken?: string) => {
    e.preventDefault();
    if (!turnstileToken) {
      setShowTurnstile(true);
      return;
    }
    try {
      await onSubmit(e, turnstileToken);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setShowTurnstile(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
      </TabsList>

      <TabsContent value="password">
        <PasswordLoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          stayLoggedIn={stayLoggedIn}
          setStayLoggedIn={setStayLoggedIn}
          loading={loading}
          onSubmit={handleSubmit}
          showTurnstile={showTurnstile}
        />
      </TabsContent>

      <TabsContent value="magic-link">
        <MagicLinkForm
          email={email}
          setEmail={setEmail}
          loading={loading}
          onSubmit={onMagicLinkLogin}
        />
      </TabsContent>
    </Tabs>
  );
};
