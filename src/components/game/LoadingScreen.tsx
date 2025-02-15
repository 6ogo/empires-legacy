
import React from "react";
import { Loader } from "lucide-react";

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen = ({ message }: LoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
      <Loader className="w-8 h-8 text-game-gold animate-spin mb-4" />
      <div className="text-white text-lg">{message}</div>
    </div>
  );
};

export default LoadingScreen;
