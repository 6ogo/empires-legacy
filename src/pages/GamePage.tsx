
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./Index";
import LoadingScreen from "@/components/game/LoadingScreen";

const GamePage = () => {
  const { user, profile, isLoading, error } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (error) {
    console.error('Authentication error:', error);
    return <Navigate to="/auth" replace />;
  }

  if (!user || !profile) {
    console.log('No user or profile, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  return <Index />;
};

export default GamePage;
