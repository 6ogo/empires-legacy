
import React from "react";

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

const ErrorScreen = ({ message, onRetry }: ErrorScreenProps) => {
  return (
    <div className="min-h-screen bg-[#141B2C] flex flex-col items-center justify-center">
      <div className="text-white text-lg mb-4">{message}</div>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-game-gold text-black rounded hover:bg-game-gold/90"
      >
        Return to Menu
      </button>
    </div>
  );
};

export default ErrorScreen;
