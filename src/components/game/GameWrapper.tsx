import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Trophy } from 'lucide-react';
import TournamentsList from './tournaments/TournamentsList';

import { GameStatus } from "@/types/game";
import PreGameScreens from "@/components/game/PreGameScreens";
import MainMenu from "@/components/game/MainMenu";

interface GameWrapperProps {
  showLeaderboard: boolean;
  gameStatus: GameStatus;
  gameMode: "local" | "online" | null;
  onBackToMenu: () => void;
  onSelectMode: (mode: "local" | "online") => void;
  onCreateGame: (numPlayers: number, boardSize: number) => Promise<void>;
  onJoinGame: () => Promise<void>;
  joinRoomId: string;
  onJoinRoomIdChange: (value: string) => void;
  isHost: boolean;
  onStartAnyway: () => void;
  onShowLeaderboard: () => void;
  onShowStats: () => void;
  connectedPlayers: { username: string }[];
}

const GameWrapper = ({
  showLeaderboard,
  gameStatus,
  gameMode,
  onBackToMenu,
  onSelectMode,
  onCreateGame,
  onJoinGame,
  joinRoomId,
  onJoinRoomIdChange,
  isHost,
  onStartAnyway,
  onShowLeaderboard,
  onShowStats,
  connectedPlayers,
}: GameWrapperProps) => {
  const [showTournaments, setShowTournaments] = useState(false);

  const handleBackToMenu = () => {
    console.log("Back to menu clicked");
    onBackToMenu();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="px-4 py-6 md:px-6 md:py-8 w-full">
        <PreGameScreens
          showLeaderboard={showLeaderboard}
          gameStatus={gameStatus}
          onBackToMenu={handleBackToMenu}
        >
          <MainMenu
            gameStatus={gameStatus}
            gameMode={gameMode}
            onSelectMode={onSelectMode}
            onCreateGame={onCreateGame}
            onJoinGame={onJoinGame}
            joinRoomId={joinRoomId}
            onJoinRoomIdChange={onJoinRoomIdChange}
            isHost={isHost}
            onStartAnyway={onStartAnyway}
            onShowLeaderboard={onShowLeaderboard}
            onShowStats={onShowStats}
            connectedPlayers={connectedPlayers}
          />
        </PreGameScreens>
      </div>
      <div className="fixed top-4 right-4 flex gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Trophy className="w-4 h-4" />
              Tournaments
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Active Tournaments</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <TournamentsList />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default GameWrapper;
