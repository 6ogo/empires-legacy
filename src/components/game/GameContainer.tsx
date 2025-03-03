
import React from "react";
import GameBoard from "./GameBoard";
import { GameControls } from "./GameControls";
import { GameTopBar } from "./GameTopBar";
import { toast } from "sonner";

interface GameContainerProps {
  settings: {
    boardSize: string;
    playerCount: number;
    gameMode: string;
    playerNames: string[];
    playerColors: string[];
  };
  onExitGame: () => void;
  onError?: (message: string) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ 
  settings, 
  onExitGame,
  onError
}) => {
  const [territories, setTerritories] = React.useState<any[]>([]);
  const [players, setPlayers] = React.useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = React.useState<number>(0);
  const [selectedTerritory, setSelectedTerritory] = React.useState<number | null>(null);
  const [phase, setPhase] = React.useState<"setup" | "playing">("setup");
  const [actionTaken, setActionTaken] = React.useState<boolean>(false);
  const [expandableTerritories, setExpandableTerritories] = React.useState<number[]>([]);
  const [attackableTerritories, setAttackableTerritories] = React.useState<number[]>([]);
  const [buildableTerritories, setBuildableTerritories] = React.useState<number[]>([]);
  const [recruitableTerritories, setRecruitableTerritories] = React.useState<number[]>([]);
  const [currentAction, setCurrentAction] = React.useState<"none" | "build" | "expand" | "attack" | "recruit">("none");
  const [actionsPerformed, setActionsPerformed] = React.useState({
    build: false,
    recruit: false,
    expand: false,
    attack: false,
  });
  const [turn, setTurn] = React.useState(1);

  const handleError = React.useCallback((message: string) => {
    console.error("Game error:", message);
    if (onError) {
      onError(message);
    }
  }, [onError]);

  React.useEffect(() => {
    try {
      const generateMap = () => {
        const boardSize = settings.boardSize === "small" ? 5 : settings.boardSize === "medium" ? 7 : 9;
        const newTerritories = [];
        let idCounter = 0;
        
        for (let q = -boardSize; q <= boardSize; q++) {
          for (let r = Math.max(-boardSize, -q - boardSize); r <= Math.min(boardSize, -q + boardSize); r++) {
            const territory = {
              id: idCounter++,
              coordinates: { q, r },
              owner: null,
              units: 0,
              terrain: Math.random() < 0.1 ? "mountains" : Math.random() < 0.2 ? "forest" : "plains",
              resources: {
                gold: Math.floor(Math.random() * 5),
                wood: Math.floor(Math.random() * 5),
                stone: Math.floor(Math.random() * 5),
                food: Math.floor(Math.random() * 5),
              },
              building: null,
            };
            newTerritories.push(territory);
          }
        }
        return newTerritories;
      };
      
      const initialTerritories = generateMap();
      setTerritories(initialTerritories);
      
      const initialPlayers = Array(settings.playerCount).fill(null).map((_, index) => ({
        id: index,
        name: settings.playerNames[index] || `Player ${index + 1}`,
        color: settings.playerColors[index] || `hsl(${index * (360 / settings.playerCount)}, 100%, 50%)`,
        resources: {
          gold: 10,
          wood: 10,
          stone: 10,
          food: 10,
        },
      }));
      setPlayers(initialPlayers);
    } catch (error) {
      handleError(error instanceof Error ? error.message : "Failed to initialize game");
    }
  }, [settings, handleError]);

  const handleTerritorySelect = (id: number) => {
    setSelectedTerritory(id);
  };

  const handleClaimTerritory = (id: number) => {
    setTerritories(prevTerritories => {
      return prevTerritories.map(territory => {
        if (territory.id === id) {
          return { ...territory, owner: currentPlayer, units: 1 };
        }
        return territory;
      });
    });
    setActionTaken(true);
  };

  const handleAttackTerritory = (targetId: number) => {
    if (selectedTerritory === null) {
      toast.error("Select your territory first");
      return;
    }

    const attackingTerritory = territories.find(t => t.id === selectedTerritory);
    const defendingTerritory = territories.find(t => t.id === targetId);

    if (!attackingTerritory || !defendingTerritory) {
      toast.error("Invalid territories selected for attack");
      return;
    }

    if (attackingTerritory.owner !== currentPlayer) {
      toast.error("You can only attack from your own territory");
      return;
    }

    if (defendingTerritory.owner === currentPlayer) {
      toast.error("You cannot attack your own territory");
      return;
    }

    if (attackingTerritory.units <= 1) {
      toast.error("You need at least 2 units to attack");
      return;
    }

    // Simulate combat
    const attackerDice = Math.min(attackingTerritory.units - 1, 3);
    const defenderDice = Math.min(defendingTerritory.units, 2);

    const attackerRolls = Array.from({ length: attackerDice }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
    const defenderRolls = Array.from({ length: defenderDice }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);

    let attackerLosses = 0;
    let defenderLosses = 0;

    for (let i = 0; i < Math.min(attackerDice, defenderDice); i++) {
      if (attackerRolls[i] > defenderRolls[i]) {
        defenderLosses++;
      } else {
        attackerLosses++;
      }
    }

    // Update territories based on combat results
    setTerritories(prevTerritories => {
      return prevTerritories.map(territory => {
        if (territory.id === attackingTerritory.id) {
          const updatedUnits = Math.max(1, territory.units - attackerLosses);
          return { ...territory, units: updatedUnits };
        }
        if (territory.id === defendingTerritory.id) {
          const updatedUnits = Math.max(0, territory.units - defenderLosses);
          
          if (updatedUnits === 0) {
            // Territory conquered
            return { ...territory, owner: currentPlayer, units: 1 };
          } else {
            return { ...territory, units: updatedUnits };
          }
        }
        return territory;
      });
    });

    setActionsPerformed(prev => ({ ...prev, attack: true }));
    toast.success(`Attacker lost ${attackerLosses} units, Defender lost ${defenderLosses} units`);
  };

  React.useEffect(() => {
    if (phase === "setup" && actionTaken) {
      setTimeout(() => {
        setCurrentPlayer((currentPlayer + 1) % settings.playerCount);
        setActionTaken(false);
      }, 500);
    }
  }, [actionTaken, currentPlayer, settings.playerCount, phase]);

  React.useEffect(() => {
    if (phase === "setup" && territories.filter(t => t.owner === null).length === 0) {
      setPhase("playing");
    }
  }, [territories, settings.playerCount, phase]);

  const calculateExpandableTerritories = React.useCallback(() => {
    const ownedTerritories = territories.filter(t => t.owner === currentPlayer);
    const adjacentTerritories = new Set<number>();

    ownedTerritories.forEach(territory => {
      const { q, r } = territory.coordinates;
      const directions = [
        { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
        { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
      ];

      directions.forEach(dir => {
        const adjacent = territories.find(t => t.coordinates.q === q + dir.q && t.coordinates.r === r + dir.r);
        if (adjacent && adjacent.owner === null) {
          adjacentTerritories.add(adjacent.id);
        }
      });
    });

    setExpandableTerritories(Array.from(adjacentTerritories));
  }, [territories, currentPlayer]);

  const calculateAttackableTerritories = React.useCallback(() => {
    const ownedTerritories = territories.filter(t => t.owner === currentPlayer);
    const adjacentTerritories = new Set<number>();

    ownedTerritories.forEach(territory => {
      const { q, r } = territory.coordinates;
      const directions = [
        { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
        { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
      ];

      directions.forEach(dir => {
        const adjacent = territories.find(t => t.coordinates.q === q + dir.q && t.coordinates.r === r + dir.r);
        if (adjacent && adjacent.owner !== null && adjacent.owner !== currentPlayer) {
          adjacentTerritories.add(adjacent.id);
        }
      });
    });

    setAttackableTerritories(Array.from(adjacentTerritories));
  }, [territories, currentPlayer]);

  const calculateBuildableTerritories = React.useCallback(() => {
    const ownedTerritories = territories.filter(t => t.owner === currentPlayer);
    const buildable = ownedTerritories.filter(t => t.building === null).map(t => t.id);
    setBuildableTerritories(buildable);
  }, [territories, currentPlayer]);

  const calculateRecruitableTerritories = React.useCallback(() => {
    const ownedTerritories = territories.filter(t => t.owner === currentPlayer);
    setRecruitableTerritories(ownedTerritories.map(t => t.id));
  }, [territories, currentPlayer]);

  React.useEffect(() => {
    if (phase === "playing") {
      calculateExpandableTerritories();
      calculateAttackableTerritories();
      calculateBuildableTerritories();
      calculateRecruitableTerritories();
    }
  }, [phase, calculateExpandableTerritories, calculateAttackableTerritories, calculateBuildableTerritories, calculateRecruitableTerritories]);

  const endTurn = () => {
    setCurrentPlayer((currentPlayer + 1) % settings.playerCount);
    if ((currentPlayer + 1) % settings.playerCount === 0) {
      // If we've gone through all players, increment the turn counter
      setTurn(prevTurn => prevTurn + 1);
    }
    setActionsPerformed({
      build: false,
      recruit: false,
      expand: false,
      attack: false,
    });
    setCurrentAction("none");
  };

  // Handler functions for actions
  const handleBuildClick = () => {
    setCurrentAction(currentAction === "build" ? "none" : "build");
  };

  const handleRecruitClick = () => {
    setCurrentAction(currentAction === "recruit" ? "none" : "recruit");
  };

  const handleExpandClick = () => {
    setCurrentAction(currentAction === "expand" ? "none" : "expand");
  };

  const handleAttackClick = () => {
    setCurrentAction(currentAction === "attack" ? "none" : "attack");
  };

  // Define error messages for actions
  const errorMessages = {
    build: "No buildable territories",
    recruit: "No territories to recruit in",
    expand: "No expandable territories",
    attack: "No attackable territories"
  };

  return (
    <div className="h-full w-full flex flex-col">
      <GameTopBar 
        currentPlayer={currentPlayer} 
        players={players} 
        phase={phase} 
        onExitGame={onExitGame}
        turn={turn}
        playerColor={players[currentPlayer]?.color}
        playerName={players[currentPlayer]?.name}
      />
      
      <div className="flex-1 flex">
        <GameBoard 
          territories={territories}
          players={players}
          selectedTerritory={selectedTerritory}
          onTerritorySelect={handleTerritorySelect}
          onClaimTerritory={handleClaimTerritory}
          onAttackTerritory={handleAttackTerritory}
          currentPlayer={currentPlayer}
          phase={phase}
          actionTaken={actionTaken}
          expandableTerritories={expandableTerritories}
          attackableTerritories={attackableTerritories}
          buildableTerritories={buildableTerritories}
          recruitableTerritories={recruitableTerritories}
          currentAction={currentAction}
          actionsPerformed={actionsPerformed}
        />
      </div>
      
      <GameControls 
        onBuildClick={handleBuildClick}
        onRecruitClick={handleRecruitClick}
        onExpandClick={handleExpandClick}
        onAttackClick={handleAttackClick}
        onEndTurnClick={endTurn}
        disabled={phase === "setup"}
        actionTaken={actionTaken}
        expandMode={currentAction === "expand"}
        attackMode={currentAction === "attack"}
        canAttack={attackableTerritories.length > 0}
        hasResourcesForExpansion={expandableTerritories.length > 0} 
        canRecruit={recruitableTerritories.length > 0}
        canBuild={buildableTerritories.length > 0}
        actionsPerformed={actionsPerformed}
        errorMessages={errorMessages}
      />
    </div>
  );
};
