
import React from "react";
import { GameWrapper } from "../components/game/GameWrapper";
import ErrorBoundary from "../components/ErrorBoundary";

const GamePage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        <GameWrapper />
      </div>
    </ErrorBoundary>
  );
};

export default GamePage;
