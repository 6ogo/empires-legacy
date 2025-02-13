import React, { useState, useEffect } from "react";
import { GameState, GameUpdate } from "@/types/game";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import GameModeSelect from "@/components/game/GameModeSelect";
import BoardSizeSelect from "@/components/game/BoardSizeSelect";
import GameBoard from "@/components/game/GameBoard";
import { createInitialGameState } from "@/lib/game-utils";
import { useGameState } from "@/hooks/useGameState";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import { Button } from "@/components/ui/button";
import { militaryUnits } from "@/data/military-units";

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

  const onStartAnyway = async () => {
    const success = await handleStartAnyway();
    if (success) {
      setGameStatus('playing');
    }
  };

  const handleEndTurn = async () => {
    if (!gameState) return;

    const nextPlayer = gameState.currentPlayer === "player1" ? "player2" : "player1";

    const newUpdate: GameUpdate = {
      type: "turn_ended",
      message: `${gameState.currentPlayer} ended their turn`,
      timestamp: Date.now(),
    };

    const updatedState: GameState = {
      ...gameState,
      currentPlayer: nextPlayer,
      phase: "resource",
      turn: gameState.turn + 1,
      updates: [...gameState.updates, newUpdate],
    };

    setGameState(updatedState);

    if (gameMode === "online" && gameId) {
      try {
        const { error } = await supabase
          .from('games')
          .update({ 
            state: updatedState as unknown as Json,
            current_player: nextPlayer,
            phase: "resource",
          })
          .eq('id', gameId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating game:', error);
        toast.error('Failed to update game state. Please try again.');
      }
    }

    toast.success(`${nextPlayer}'s turn begins!`);
  };

  const collectResources = () => {
    if (!gameState) return;

    const currentPlayer = gameState.players.find(
      (p) => p.id === gameState.currentPlayer
    );

    if (!currentPlayer) return;

    const ownedTerritories = gameState.territories.filter(
      (t) => t.owner === gameState.currentPlayer
    );

    const resourceGains = ownedTerritories.reduce(
      (acc, territory) => {
        acc.gold += 10;  // Increased base resources
        acc.wood += 5;
        acc.stone += 5;
        acc.food += 5;

        Object.entries(territory.resources).forEach(([resource, amount]) => {
          acc[resource as keyof typeof acc] += amount * 3;  // Increased multiplier
        });

        if (territory.building === "lumber_mill") acc.wood += 20;  // Increased to 20
        if (territory.building === "mine") acc.stone += 20;  // Increased to 20
        if (territory.building === "market") {
          acc.gold += 20;  // Increased to 20
          acc.gold += (currentPlayer.resources.wood * 2);  // +2 gold per wood
          acc.gold += (currentPlayer.resources.stone * 2); // +2 gold per stone
          acc.gold += (currentPlayer.resources.food * 5);  // +5 gold per food
        }
        if (territory.building === "farm") acc.food += 8;

        return acc;
      },
      { gold: 0, wood: 0, stone: 0, food: 0 }
    );

    const updatedPlayers = gameState.players.map((player) =>
      player.id === gameState.currentPlayer
        ? {
            ...player,
            resources: {
              gold: player.resources.gold + resourceGains.gold,
              wood: player.resources.wood + resourceGains.wood,
              stone: player.resources.stone + resourceGains.stone,
              food: player.resources.food + resourceGains.food,
            },
          }
        : player
    );

    setGameState({
      ...gameState,
      players: updatedPlayers,
    });

    const marketBonus = ownedTerritories.some(t => t.building === "market")
      ? ` (+${currentPlayer.resources.wood * 2} gold from wood, +${currentPlayer.resources.stone * 2} gold from stone, +${currentPlayer.resources.food * 5} gold from food)`
      : '';

    toast.success(
      `Resources collected: ${Object.entries(resourceGains)
        .map(([resource, amount]) => `${amount} ${resource}`)
        .join(", ")}${marketBonus}`
    );
  };

  const handleBuild = async (buildingType: string) => {
    if (!gameState || !selectedTerritory) return;

    const cost = {
      lumber_mill: { gold: 50, wood: 20 },
      mine: { gold: 50, stone: 20 },
      market: { gold: 100, wood: 30 },
      farm: { gold: 50, wood: 20 },
      road: { wood: 25, stone: 25 },
      barracks: { gold: 150, wood: 50, stone: 50 },
      fortress: { gold: 300, stone: 150 },
    }[buildingType];

    if (!cost) return;

    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (!currentPlayer) return;

    const updatedResources = { ...currentPlayer.resources };
    Object.entries(cost).forEach(([resource, amount]) => {
      updatedResources[resource as keyof typeof updatedResources] -= amount;
    });

    const updatedTerritories = gameState.territories.map(t =>
      t.id === selectedTerritory.id
        ? { ...t, building: buildingType }
        : t
    );

    const updatedPlayers = gameState.players.map(p =>
      p.id === gameState.currentPlayer
        ? { ...p, resources: updatedResources }
        : p
    );

    const updatedState = {
      ...gameState,
      territories: updatedTerritories,
      players: updatedPlayers,
    };

    setGameState(updatedState);

    if (gameMode === "online" && gameId) {
      try {
        const { error } = await supabase
          .from('games')
          .update({ 
            state: updatedState as unknown as Json,
          })
          .eq('id', gameId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating game:', error);
        toast.error('Failed to update game state. Please try again.');
      }
    }

    toast.success(`Built ${buildingType} in selected territory!`);
  };

  const handleEndPhase = () => {
    if (!gameState) return;

    const phases: GameState["phase"][] = [
      "resource",
      "building",
      "recruitment",
      "movement",
      "combat",
    ];
    
    const currentPhaseIndex = phases.indexOf(gameState.phase as any);
    const nextPhase = currentPhaseIndex === phases.length - 1
      ? phases[0]
      : phases[currentPhaseIndex + 1];

    if (gameState.phase === "resource") {
      collectResources();
    }

    if (currentPhaseIndex === phases.length - 1) {
      handleEndTurn();
      return;
    }

    setGameState({
      ...gameState,
      phase: nextPhase,
    });

    toast.success(`Moving to ${nextPhase} phase`);
  };

  const handleGiveUp = () => {
    if (!gameState) return;
    
    if (gameState.players.length === 2) {
      const winner = gameState.players.find(p => p.id !== gameState.currentPlayer);
      if (winner) {
        toast.success(`${winner.id} wins!`);
        setGameStarted(false);
        setGameStatus("menu");
      }
    } else {
      const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer);
      const remainingPlayers = gameState.players.filter(p => p.id !== gameState.currentPlayer);
      
      if (remainingPlayers.length === 1) {
        toast.success(`${remainingPlayers[0].id} wins!`);
        setGameStarted(false);
        setGameStatus("menu");
      } else {
        const nextPlayer = gameState.players[(currentPlayerIndex + 1) % gameState.players.length].id;
        setGameState({
          ...gameState,
          players: remainingPlayers,
          currentPlayer: nextPlayer,
        });
        toast.info(`${gameState.currentPlayer} has given up!`);
      }
    }
  };

  const handleRecruit = async (unitType: string) => {
    if (!gameState || !selectedTerritory) return;

    const unit = militaryUnits[unitType];
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayer);

    if (!currentPlayer) return;

    const updatedResources = { ...currentPlayer.resources };
    Object.entries(unit.cost).forEach(([resource, cost]) => {
      updatedResources[resource as keyof typeof updatedResources] -= cost || 0;
    });

    const updatedTerritories = gameState.territories.map(t =>
      t.id === selectedTerritory.id
        ? { ...t, militaryUnit: unit }
        : t
    );

    const updatedPlayers = gameState.players.map(p =>
      p.id === gameState.currentPlayer
        ? { ...p, resources: updatedResources }
        : p
    );

    const updatedState = {
      ...gameState,
      territories: updatedTerritories,
      players: updatedPlayers,
    };

    setGameState(updatedState);

    if (gameMode === "online" && gameId) {
      try {
        const { error } = await supabase
          .from('games')
          .update({ 
            state: updatedState as unknown as Json,
          })
          .eq('id', gameId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating game:', error);
        toast.error('Failed to update game state. Please try again.');
      }
    }

    toast.success(`Recruited ${unitType} in selected territory!`);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-game-gold mb-8">Empire's Legacy</h1>
        
        {gameStatus === "menu" && (
          <GameModeSelect onSelectMode={(mode) => {
            setGameMode(mode);
            setGameStatus("mode_select");
          }} />
        )}

        {gameStatus === "mode_select" && (
          <BoardSizeSelect
            onCreateGame={onCreateGame}
            gameMode={gameMode!}
            onJoinGame={onJoinGame}
            joinRoomId={joinRoomId}
            onJoinRoomIdChange={(value) => setJoinRoomId(value)}
          />
        )}

        {gameStatus === "waiting" && (
          <div className="text-center">
            <h2 className="text-2xl mb-4">Waiting for players...</h2>
            {isHost && (
              <Button onClick={onStartAnyway} className="mt-4">
                Start Game Anyway
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!gameState) return null;

  return (
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
  );
};

export default Index;
