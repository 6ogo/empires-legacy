// src/pages/GamePage.tsx
import React, { useState, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import GameStartMenu from "@/components/game/GameStartMenu";
import GameScreen from "@/components/game/GameScreen";
import { GameStatus, GameMode } from "@/types/game";
import { toast } from "sonner";
import { createInitialGameState } from "@/lib/game-utils";
import { useGameState } from "@/hooks/useGameState";
import LoadingScreen from "@/components/game/LoadingScreen";
import CombatHistory from "@/components/game/CombatHistory";

const GamePage = () => {
  const navigate = useNavigate();
  const [gameStatus, setGameStatus] = useState<GameStatus>("menu");
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [showCombatHistory, setShowCombatHistory] = useState(false);
  const [selectedBoardSize, setSelectedBoardSize] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize with a placeholder game state that will be replaced
  const { 
    gameState, 
    dispatchAction, 
    resetState 
  } = useGameState(createInitialGameState(2, 20));

  const handleSelectMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setGameStatus("mode_select");
  }, []);

  const handleCreateGame = useCallback(async (numPlayers: number, boardSize: number, enableRNG?: boolean) => {
    try {
      setIsLoading(true);
      setSelectedBoardSize(boardSize);
      setSelectedPlayers(numPlayers);
      
      // Create a new game state
      const newGameState = createInitialGameState(numPlayers, boardSize);
      
      // Reset the game state with our new state
      resetState(newGameState);
      
      // Update game status
      setGameStatus("playing");
      toast.success("Game created successfully!");
      
      return newGameState;
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [resetState]);

  const handleBackToMenu = useCallback(() => {
    setGameStatus("menu");
    setGameMode(null);
  }, []);

  const handleBack = useCallback(() => {
    if (gameStatus === "playing") {
      if (confirm("Are you sure you want to exit the game? All progress will be lost.")) {
        setGameStatus("mode_select");
      }
    } else if (gameStatus === "mode_select") {
      setGameStatus("menu");
      setGameMode(null);
    } else {
      navigate('/');
    }
  }, [gameStatus, navigate]);

  if (isLoading) {
    return <LoadingScreen message="Creating your game..." />;
  }

  return (
    <div className="min-h-screen bg-[#141B2C] overflow-hidden">
      {gameStatus === "playing" && gameState ? (
        <>
          <GameScreen 
            gameState={gameState}
            dispatchAction={dispatchAction}
            onShowCombatHistory={() => setShowCombatHistory(true)}
            onBack={handleBack}
          />
          {showCombatHistory && (
            <CombatHistory
              gameState={gameState}
              onClose={() => setShowCombatHistory(false)}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          {gameStatus === "menu" && (
            <div className="w-full max-w-xl text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold text-game-gold mb-8 md:mb-12">Empires' Legacy</h1>
              <div className="space-y-8">
                <h2 className="text-4xl font-semibold mb-12">Select Game Mode</h2>
                <div className="flex gap-8 justify-center">
                  <button
                    onClick={() => handleSelectMode("local")}
                    className="bg-[#141B2C] hover:bg-[#1f2937] text-white text-2xl px-12 py-8 rounded-lg border border-white/10"
                  >
                    Local Game
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {gameStatus === "mode_select" && (
            <GameStartMenu
              gameStatus={gameStatus}
              gameMode={gameMode || "local"}
              onSelectMode={handleSelectMode}
              onCreateGame={handleCreateGame}
              onJoinGame={async () => false}
              joinRoomId=""
              onJoinRoomIdChange={() => {}}
              connectedPlayers={[]}
              onShowRandomEventsInfo={() => {}}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GamePage;