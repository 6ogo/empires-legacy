import React, { useState, useEffect } from "react";
import { GameState } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import GameBoard from "@/components/game/GameBoard";
import { createInitialGameState } from "@/lib/game-utils";
import { useGameState } from "@/hooks/useGameState";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { useGameActions } from "@/hooks/useGameActions";
import GameStartMenu from "@/components/game/GameStartMenu";
import GameUpdatesPanel from "@/components/game/GameUpdatesPanel";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState<"menu" | "mode_select" | "creating" | "joining" | "playing" | "waiting">("menu");
  const [gameMode, setGameMode] = useState<"local" | "online" | null>(null);

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
    handleCreateGame,
    handleJoinGame,
    handleStartAnyway,
  } = useOnlineGame();

  const {
    handleEndTurn,
    handleEndPhase,
    handleGiveUp,
    collectResources,
  } = useGameActions(gameState, setGameState, gameMode, gameId);

  const handleBuild = (buildingType: string) => {
    if (!gameState || !selectedTerritory) return;

    const buildingCost = {
      lumber_mill: { gold: 50, wood: 20 },
      mine: { gold: 50, stone: 20 },
      market: { gold: 100, wood: 30 },
      farm: { gold: 50, wood: 20 },
      road: { wood: 25, stone: 25 },
      barracks: { gold: 150, wood: 50, stone: 50 },
      fortress: { gold: 300, stone: 150 },
    }[buildingType];

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

    const unitCost = {
      infantry: { gold: 100, food: 1 },
      cavalry: { gold: 200, food: 2 },
      artillery: { gold: 300, food: 2 },
    }[unitType];

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
            gold: player.resources.gold - (unitCost.gold || 0),
            food: player.resources.food - (unitCost.food || 0),
          },
          units: {
            ...player.units,
            [unitType]: (player.units[unitType] || 0) + 1,
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

  useEffect(() => {
    if (gameId) {
      const fetchGame = async () => {
        try {
          const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('id', gameId)
            .single();

          if (error) throw error;

          if (data) {
            setGameState(data.state as unknown as GameState);
            setGameStarted(true);
            setGameStatus(data.game_status === 'waiting' ? 'waiting' : 'playing');
            toast.success(`Game loaded!`);
          }
        } catch (error) {
          console.error('Error loading game:', error);
          toast.error('Failed to load game. Please try again.');
        }
      };

      const channel = supabase
        .channel(`game_${gameId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        }, (payload) => {
          const gameData = payload.new;
          setGameState(gameData.state as unknown as GameState);
          if (gameData.game_status === 'playing') {
            setGameStatus('playing');
          }
        })
        .subscribe();

      fetchGame();

      return () => {
        supabase.removeChannel(channel);
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
      setGameStarted(true);
      setGameStatus("waiting");
    }
  };

  const onJoinGame = async () => {
    const data = await handleJoinGame();
    if (data) {
      setGameState(data.state as unknown as GameState);
      setGameStarted(true);
      setGameStatus(data.joined_players + 1 === data.num_players ? 'playing' : 'waiting');
    }
  };

  if (!gameStarted) {
    return (
      <GameStartMenu
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
      />
    );
  }

  if (!gameState) return null;

  return (
    <>
      <GameBoard
        gameState={gameState}
        selectedTerritory={selectedTerritory}
        onTerritoryClick={(territory) => handleTerritoryClick(territory, gameId)}
        onEndTurn={handleEndTurn}
        onEndPhase={handleEndPhase}
        onBuild={handleBuild}
        onRecruit={handleRecruit}
        onGiveUp={handleGiveUp}
      />
      <GameUpdatesPanel gameState={gameState} />
    </>
  );
};

export default Index;
