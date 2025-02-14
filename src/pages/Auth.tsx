
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuthForm } from "@/hooks/useAuthForm";

const Auth = () => {
  const navigate = useNavigate();
  const {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    loading,
    stayLoggedIn,
    setStayLoggedIn,
    handleSignIn,
    handleSignUp,
    handleMagicLinkLogin,
  } = useAuthForm();

  useEffect(() => {
    const checkSession = async () => {
      console.log('Checking session...'); // Debug log
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error); // Debug log
        return;
      }
      
      if (session) {
        console.log('Active session found, redirecting...', session); // Debug log
        navigate("/game", { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email); // Debug log
      
      if (session) {
        navigate("/game", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-game-gold">Empire's Legacy</CardTitle>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
            <TabsTrigger value="signin" className="data-[state=active]:bg-zinc-700">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-zinc-700">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="text-white">
            <SignInForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              stayLoggedIn={stayLoggedIn}
              setStayLoggedIn={setStayLoggedIn}
              loading={loading}
              onSubmit={handleSignIn}
              onMagicLinkLogin={handleMagicLinkLogin}
            />
          </TabsContent>
          <TabsContent value="signup" className="text-white">
            <SignUpForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              username={username}
              setUsername={setUsername}
              stayLoggedIn={stayLoggedIn}
              setStayLoggedIn={setStayLoggedIn}
              loading={loading}
              onSubmit={handleSignUp}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
