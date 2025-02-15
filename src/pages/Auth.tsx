
import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
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
    showTurnstile,
  } = useAuthForm();

  useEffect(() => {
    if (user && profile) {
      navigate('/game', { replace: true });
    }
  }, [user, profile, navigate]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Link 
        to="/" 
        className="fixed top-4 left-4 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-yellow-400">Empire's Legacy</CardTitle>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900"
            >
              Sign Up
            </TabsTrigger>
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
              showTurnstile={showTurnstile}
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
              showTurnstile={showTurnstile}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
