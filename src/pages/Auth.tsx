import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import LoadingScreen from "@/components/game/LoadingScreen";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    username,
    setUsername,
    loading: authFormLoading,
    stayLoggedIn,
    setStayLoggedIn,
    handleSignIn,
    handleSignUp,
    handleMagicLinkLogin,
    showTurnstile,
    validationErrors,
  } = useAuthForm();

  useEffect(() => {
    if (user && profile) {
      console.log('User authenticated, navigating to game');
      navigate('/game', { replace: true });
    }
  }, [user, profile, navigate]);

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If already authenticated, redirect to game
  if (user && profile) {
    return <Navigate to="/game" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
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
              loading={authFormLoading}
              onSubmit={handleSignIn}
              onMagicLinkLogin={handleMagicLinkLogin}
              showTurnstile={showTurnstile}
              validationErrors={validationErrors}
            />
          </TabsContent>
          <TabsContent value="signup" className="text-white">
            <SignUpForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              username={username}
              setUsername={setUsername}
              stayLoggedIn={stayLoggedIn}
              setStayLoggedIn={setStayLoggedIn}
              loading={authFormLoading}
              onSubmit={handleSignUp}
              showTurnstile={showTurnstile}
              validationErrors={validationErrors}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;