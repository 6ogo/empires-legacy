
import React from "react";
import Leaderboard from "./Leaderboard";
import Stats from "./Stats";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PreGameScreensProps {
  showLeaderboard: boolean;
  gameStatus: "menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats";
  onBackToMenu: () => void;
  children?: React.ReactNode;
}

const PreGameScreens: React.FC<PreGameScreensProps> = ({
  showLeaderboard,
  gameStatus,
  onBackToMenu,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/game');
  };

  if (showLeaderboard) {
    return (
      <div className="p-4">
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-4 hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        <Leaderboard />
      </div>
    );
  }

  if (gameStatus === "stats") {
    return (
      <div className="container mx-auto p-4">
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-4 hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        <Stats />
      </div>
    );
  }

  return <>{children}</>;
};

export default PreGameScreens;
