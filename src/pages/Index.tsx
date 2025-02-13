import React, { useState, useEffect } from "react";
import { GameState, Territory, Resources } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createInitialGameState } from "@/lib/game-utils";
import { useGameState } from "@/hooks/useGameState";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { useGameActions } from "@/hooks/useGameActions";
import MainMenu from "@/components/game/MainMenu";
import PreGameScreens from "@/components/game/PreGameScreens";
import GameScreen from "@/components/game/GameScreen";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState<"menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting" | "stats">("menu");
  const [gameMode, setGameMode] = useState<"local" | "online" | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const {
    gameState,
    setGameState,
    selectedTerritory,
    setSelectedTerritory,
    handleTerritoryClick,
  } = useGameState(gameMode);

  const {
    gameId,
    roomId,
    joinRoomId,
    setJoinRoomId,
    isHost,
    connectedPlayers,
    handleCreateGame,
    handleJoinGame,
    handleStartAnyway,
  } = useOnlineGame();

  const {
    handleEndTurn,
    handleEndPhase,
    handleGiveUp,
  } = useGameActions(gameState, setGameState, gameMode, gameId);

  useEffect(() => {
    if (gameId) {
      const subscription = supabase
        .channel(`game_updates_${gameId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        }, (payload: any) => {
          if (payload.new.game_status === 'playing') {
            setGameStarted(true);
            setGameStatus('playing');
            setGameState(payload.new.state as GameState);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [gameId]);

  const onCreateGame = async (numPlayers: number, boardSize: number) => {
    if (gameMode === "local") {
      const initialState = createInitialGameState(numPlayers, boardSize);
      setGameState(initialState);
      setGameStarted(true);
      setGameStatus("playing");
      return;
    }
    
    const result = await handleCreateGame(numPlayers, boardSize);
    if (result) {
      setGameState(result.initialState);
      setGameStatus("waiting");
    }
  };

  const onJoinGame = async () => {
    const data = await handleJoinGame();
    if (data) {
      setGameState(data.state as GameState);
      setGameStatus(data.game_status === 'playing' ? 'playing' : 'waiting');
      if (data.game_status === 'playing') {
        setGameStarted(true);
      }
    }
  };

  const handleBuild = (buildingType: string) => {
    if (!gameState || !selectedTerritory) return;

    const buildingCost: Partial<Resources> = {
      lumber_mill: { gold: 50, wood: 20, stone: 0, food: 0 },
      mine: { gold: 50, stone: 20, wood: 0, food: 0 },
      market: { gold: 100, wood: 30, stone: 0, food: 0 },
      farm: { gold: 50, wood: 20, stone: 0, food: 0 },
      road: { wood: 25, stone: 25, gold: 0, food: 0 },
      barracks: { gold: 150, wood: 50, stone: 50, food: 0 },
      fortress: { gold: 300, stone: 150, wood: 0, food: 0 },
    }[buildingType] || { gold: 0, wood: 0, stone: 0, food: 0 };

    if (!buildingCost) {
      toast.error("Invalid building type!");
      return;
    }

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer) return;

    if (currentPlayer.resources.gold < (buildingCost.gold || 0) ||
        currentPlayer.resources.wood < (buildingCost.wood || 0) ||
        currentPlayer.resources.stone < (buildingCost.stone || 0) ||
        currentPlayer.resources.food < (buildingCost.food || 0)) {
      toast.error("Insufficient resources!");
      return;
    }

    const updatedPlayers = gameState.players.map(player => {
      if (player.id === gameState.currentPlayer) {
        return {
          ...player,
          resources: {
            gold: player.resources.gold - (buildingCost.gold || 0),
            wood: player.resources.wood - (buildingCost.wood || 0),
            stone: player.resources.stone - (buildingCost.stone || 0),
            food: player.resources.food - (buildingCost.food || 0),
          },
        };
      }
      return player;
    });

    const updatedTerritories = gameState.territories.map(t => {
      if (t.id === selectedTerritory.id) {
        return {
          ...t,
          building: buildingType,
        };
      }
      return t;
    });

    setGameState({
      ...gameState,
      players: updatedPlayers,
      territories: updatedTerritories,
    });

    toast.success(`${buildingType} built!`);
    setSelectedTerritory(null);
  };

  const handleRecruit = (unitType: string) => {
    if (!gameState || !selectedTerritory) return;

    const unitCost: Partial<Resources> = {
      infantry: { gold: 100, food: 1, wood: 0, stone: 0 },
      cavalry: { gold: 200, food: 2, wood: 0, stone: 0 },
      artillery: { gold: 300, food: 2, wood: 0, stone: 0 },
    }[unitType] || { gold: 0, food: 0, wood: 0, stone: 0 };

    if (!unitCost) {
      toast.error("Invalid unit type!");
      return;
    }

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer) return;

    if (currentPlayer.resources.gold < (unitCost.gold || 0) ||
        currentPlayer.resources.food < (unitCost.food || 0)) {
      toast.error("Insufficient resources!");
      return;
    }

    const updatedPlayers = gameState.players.map(player => {
      if (player.id === gameState.currentPlayer) {
        return {
          ...player,
          resources: {
            ...player.resources,
            gold: player.resources.gold - (unitCost.gold || 0),
            food: player.resources.food - (unitCost.food || 0),
          },
          units: {
            ...player.units,
            [unitType]: (player.units[unitType as keyof typeof player.units] || 0) + 1,
          },
        };
      }
      return player;
    });

    setGameState({
      ...gameState,
      players: updatedPlayers,
    });

    toast.success(`${unitType} recruited!`);
    setSelectedTerritory(null);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <PreGameScreens
          showLeaderboard={showLeaderboard}
          gameStatus={gameStatus}
          onBackToMenu={() => {
            setShowLeaderboard(false);
            setGameStatus("menu");
          }}
        >
          <MainMenu
            gameStatus={gameStatus}
            gameMode={gameMode}
            onSelectMode={(mode) => {
              setGameMode(mode);
              setGameStatus("mode_select");
            }}
            onCreateGame={onCreateGame}
            onJoinGame={onJoinGame}
            joinRoomId={joinRoomId}
            onJoinRoomIdChange={setJoinRoomId}
            isHost={isHost}
            onStartAnyway={handleStartAnyway}
            onShowLeaderboard={() => setShowLeaderboard(true)}
            onShowStats={() => setGameStatus("stats")}
            connectedPlayers={connectedPlayers}
          />
        </PreGameScreens>
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <GameScreen
      gameState={gameState}
      selectedTerritory={selectedTerritory}
      onTerritoryClick={(territory) => handleTerritoryClick(territory, gameId)}
      onEndTurn={handleEndTurn}
      onEndPhase={handleEndPhase}
      onBuild={handleBuild}
      onRecruit={handleRecruit}
      onGiveUp={handleGiveUp}
    />
  );
};

export default Index;
