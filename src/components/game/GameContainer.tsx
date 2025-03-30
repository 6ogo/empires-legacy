// ================================================
// File: src/components/game/GameContainer.tsx (REVISED)
// ================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion"; // <-- Added motion import
import { GameBoard } from "./GameBoard";
import { GameTopBar } from "./GameTopBar";
import { GameControls } from "./GameControls";
import { ResourceDisplay } from "./ResourceDisplay";
import { BuildingMenu } from "./BuildingMenu";
import { RecruitmentMenu } from "./RecruitmentMenu";
import { GameMenus } from "./GameMenus";
import { ErrorScreen } from "./ErrorScreen";
import { VictoryScreen } from "./VictoryScreen"; // Import VictoryScreen
import { Button } from "../ui/button";
import { GameInfoModal } from "./GameInfoModal";
import { toast } from "sonner";
import { useMediaQuery } from "../../hooks/use-media-query";
import LoadingScreen from "./LoadingScreen"; // Import LoadingScreen

// Import UNIFIED types from src/types/game.ts
import {
  GameState,
  GamePlayer,
  Territory,
  GameUnit,
  GameBuilding,
  GameSettings,
  ResourceGain,
  BuildingType,
  UnitType,
  Resources,
  GamePhase, // Use this
  VictoryType,
  TerritoryId,
  PlayerId,
  BuildingId,
  UnitId,
  // Add other necessary types like Coordinates, etc. if needed directly
} from "@/types/game"; // Ensure path is correct

// Define PositionedMenu locally if not in types/game.ts
interface PositionedMenu {
  x: number;
  y: number;
  territory: Territory; // Use imported Territory type
}

// Building costs and bonuses based on README
const BUILDING_DEFINITIONS: Record<string, { name: string; cost: Resources; upkeep?: number; bonus?: string; description: string }> = {
  lumberMill: { name: "Lumber Mill", cost: { gold: 0, wood: 50, stone: 20, food: 0 }, bonus: "+20 Wood", description: "Increases wood production" },
  mine: { name: "Mine", cost: { gold: 0, wood: 30, stone: 50, food: 0 }, bonus: "+20 Stone", description: "Increases stone production" },
  market: { name: "Market", cost: { gold: 100, wood: 40, stone: 40, food: 0 }, bonus: "+20 Gold", description: "Increases gold income and trade" },
  farm: { name: "Farm", cost: { gold: 50, wood: 50, stone: 0, food: 0 }, bonus: "+8 Food", description: "Increases food production" },
  barracks: { name: "Barracks", cost: { gold: 150, wood: 80, stone: 60, food: 0 }, description: "Enables unit recruitment" },
  fortress: { name: "Fortress", cost: { gold: 200, wood: 50, stone: 150, food: 0 }, bonus: "Defense Bonus", description: "Provides defensive bonuses" },
  road: { name: "Road", cost: { gold: 20, wood: 10, stone: 10, food: 0 }, bonus: "Movement Bonus", description: "Improves unit movement (if implemented)" }
};

// Unit costs and upkeep based on README
const UNIT_DEFINITIONS: Record<string, { name: string; cost: Resources; upkeep: number; health: number; attack: number; defense: number; description: string }> = {
  infantry: { name: "Infantry", cost: { gold: 100, wood: 0, stone: 0, food: 0 }, upkeep: 1, health: 100, attack: 10, defense: 12, description: "Basic military unit" },
  cavalry: { name: "Cavalry", cost: { gold: 200, wood: 0, stone: 0, food: 0 }, upkeep: 2, health: 120, attack: 15, defense: 8, description: "Fast-moving unit" },
  artillery: { name: "Artillery", cost: { gold: 300, wood: 0, stone: 0, food: 0 }, upkeep: 2, health: 80, attack: 25, defense: 5, description: "Powerful ranged unit" }
};


export const GameContainer: React.FC<{
  settings: GameSettings;
  onExitGame: () => void;
}> = ({
  settings,
  onExitGame
}) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectedTerritoryId, setSelectedTerritoryId] = useState<TerritoryId | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
    const [showResourceGain, setShowResourceGain] = useState<boolean>(false);
    const [territoryClaimInProgress, setTerritoryClaimInProgress] = useState<boolean>(false);
    const [positionedMenu, setPositionedMenu] = useState<PositionedMenu | null>(null);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const [errorMessages, setErrorMessages] = useState({
      attack: "No valid targets",
      recruit: "Need barracks",
      build: "No territory selected",
      expand: "Need resources"
    });

    // --- Initialization ---
    useEffect(() => {
      try {
        setLoading(true);
        console.log("Initializing game with settings:", settings);
        const boardSize = getBoardSize(settings.playerCount, settings.boardSize);
        const territoriesData = generateTerritories(boardSize); // Generate raw data

        // Calculate adjacency after generation
        const territoriesWithAdj = territoriesData.map(t => ({
          ...t,
          adjacentTerritories: getAdjacentTerritoryIds(t, territoriesData) // Calculate here
        }));

        console.log(`Generated ${territoriesWithAdj.length} territories for size ${boardSize}`);

        const players: GamePlayer[] = Array.from({ length: settings.playerCount }, (_, i): GamePlayer => ({
          id: i, // Use number ID
          name: settings.playerNames?.[i] || `Player ${i + 1}`,
          color: settings.playerColors?.[i] || getPlayerColor(i),
          resources: { gold: 300, wood: 100, stone: 100, food: 100 },
          territories: [],
          buildings: [], // Initialize as empty array of GameBuilding
          units: [], // Initialize as empty array of GameUnit
          hasSelectedStartingTerritory: false,
          score: 0,
          ready: false, // Ensure all GamePlayer fields are initialized
        }));

        const initialState: GameState = {
          phase: "setup",
          turn: 1,
          currentPlayer: players[0].id, // Use player ID (number)
          players,
          territories: territoriesWithAdj,
          gameOver: false, // Initialize all GameState fields
          winner: null,
          victoryType: null,
          setupComplete: false,
          currentAction: "none",
          expandableTerritories: [],
          attackableTerritories: [],
          buildableTerritories: [],
          recruitableTerritories: [],
          lastResourceGain: null,
          actionsPerformed: { build: false, recruit: false, expand: false, attack: false },
          updates: [],
          weather: 'clear',
          timeOfDay: 'day',
          lastUpdated: Date.now(),
          version: 1,
        };
        setGameState(initialState);
        setLoading(false);
        console.log("Game state initialized");
      } catch (err) {
        console.error("Error initializing game:", err);
        setError("Failed to initialize game. Please try again.");
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings]); // Rerun only when settings change

    // --- Game State Updates ---
    const updateState = useCallback((updater: (prevState: GameState) => GameState) => {
      setGameState(prevState => {
        if (!prevState) return null;
        const newState = updater(prevState);
        console.log("GameState Updated:", newState.phase, `P${newState.currentPlayer}'s turn`, newState.actionsPerformed);
        return newState;
      });
    }, []);

    // --- Territory Adjacency ---
    const getAdjacentTerritoryIds = useCallback((territory: Territory, allTerritories: Territory[]): TerritoryId[] => {
      const { q, r } = territory.coordinates;
      const directions = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
      return allTerritories
        .filter(t => directions.some(dir => t.coordinates.q === q + dir.q && t.coordinates.r === r + dir.r))
        .map(t => t.id);
    }, []);


    // --- Resource Checks ---
    const hasResourcesForExpansion = useCallback((): boolean => {
      if (!gameState) return false;
      const cost = { gold: 100, wood: 0, stone: 0, food: 20 };
      const player = gameState.players.find(p => p.id === gameState.currentPlayer); // Find player by ID
      return !!player && player.resources.gold >= cost.gold && player.resources.food >= cost.food;
    }, [gameState]);


    // --- Actionable Territories Calculation ---
    const updateActionableTerritories = useCallback(() => {
      if (!gameState || gameState.phase !== "playing") return;

      const currentPlayerId = gameState.currentPlayer;
      const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
      if (!currentPlayer) return;

      const ownedTerritoryIds = new Set(currentPlayer.territories);
      const territories = gameState.territories;

      let newExpandable: TerritoryId[] = [];
      let newAttackable: TerritoryId[] = [];
      let newBuildable: TerritoryId[] = [];
      let newRecruitable: TerritoryId[] = [];

      territories.forEach(territory => {
        if (ownedTerritoryIds.has(territory.id)) {
          // Buildable: Owned territory without existing building (simple rule)
          if (!gameState.actionsPerformed.build && territory.buildings.length === 0) {
            newBuildable.push(territory.id);
          }

          // Recruitable: Owned territory with barracks and no unit (simple rule)
          const hasBarracks = territory.buildings.some(bId => {
            const building = currentPlayer.buildings.find(b => b.id === bId);
            return building?.type === 'barracks';
          });
          // Allow recruitment even if unit exists? Depends on rules. Current logic: 1 unit max.
          if (hasBarracks && !gameState.actionsPerformed.recruit && territory.units.length === 0) {
            newRecruitable.push(territory.id);
          }

          // Check adjacent for expand/attack
          (territory.adjacentTerritories || []).forEach(adjId => {
            const adjTerritory = territories.find(t => t.id === adjId);
            if (adjTerritory) {
              if (adjTerritory.owner === null && !gameState.actionsPerformed.expand) {
                if (!newExpandable.includes(adjId)) newExpandable.push(adjId);
              } else if (adjTerritory.owner !== null && adjTerritory.owner !== currentPlayerId && territory.units.length > 0 && !gameState.actionsPerformed.attack) {
                if (!newAttackable.includes(adjId)) newAttackable.push(adjId);
              }
            }
          });
        }
      });

      updateState(prevState => ({
        ...prevState,
        expandableTerritories: newExpandable,
        attackableTerritories: newAttackable,
        buildableTerritories: newBuildable,
        recruitableTerritories: newRecruitable,
      }));

      const hasUnits = currentPlayer.units.length > 0;
      const canAffordExpand = hasResourcesForExpansion();

      setErrorMessages({
        attack: newAttackable.length > 0 ? (hasUnits ? "Select attacking unit's territory first" : "No units to attack with") : "No enemy territories adjacent to units",
        recruit: newRecruitable.length > 0 ? "Select territory with barracks" : "Need barracks or territory occupied",
        build: newBuildable.length > 0 ? "Select territory to build on" : "No available territories or building limit reached",
        expand: canAffordExpand ? (newExpandable.length > 0 ? "Select territory to expand to" : "No adjacent neutral territories") : "Need 100 Gold & 20 Food",
      });

    }, [gameState, updateState, hasResourcesForExpansion]); // Ensure all dependencies are listed


    // Update actionable territories when phase, player, or actions change
    useEffect(() => {
      if (gameState?.phase === 'playing') {
        updateActionableTerritories();
      }
    }, [gameState?.phase, gameState?.currentPlayer, gameState?.actionsPerformed, updateActionableTerritories]);


    // --- Board Generation ---
    const getBoardSize = (playerCount: number, sizePreference: string): number => {
      const baseSizes: { [key: string]: number } = { small: 5, medium: 7, large: 9 };
      let playerAdjustment = playerCount > 2 ? playerCount - 2 : 0;
      let finalSize = baseSizes[sizePreference] || 7;
      finalSize += playerAdjustment;
      return Math.min(finalSize, 13);
    };

    const generateTerritories = (boardSize: number): Territory[] => {
      const territories: Territory[] = [];
      let idCounter: TerritoryId = 0; // Use TerritoryId type
      const radius = Math.floor(boardSize / 2);

      for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
          const type = getRandomTerritoryType();
          const resources = generateResourcesForType(type);
          territories.push({
            id: idCounter++,
            type,
            owner: null,
            buildings: [],
            units: [],
            position: { x: q, y: r },
            coordinates: { q, r },
            adjacentTerritories: [], // Calculated later
            resources,
            terrain: type === 'mountains' ? 'mountains' : type === 'forests' ? 'forests' : 'plains', // Use TerritoryType for terrain consistency
            lastUpdated: Date.now(),
          });
        }
      }
      return territories;
    };

    const getRandomTerritoryType = (): "plains" | "mountains" | "forests" | "coast" => {
      const types: Array<"plains" | "mountains" | "forests" | "coast"> = ["plains", "mountains", "forests", "coast"];
      const weights = [0.40, 0.25, 0.25, 0.10];
      const random = Math.random();
      let cumulativeWeight = 0;
      for (let i = 0; i < types.length; i++) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
          return types[i];
        }
      }
      return "plains";
    };

    const generateResourcesForType = (type: string): Resources => {
      const baseResources: Resources = { gold: 0, wood: 0, stone: 0, food: 0 };
      const randomFactor = 0.8 + Math.random() * 0.4;
      switch (type) {
        case "plains": baseResources.food = Math.floor(10 * randomFactor); baseResources.wood = Math.floor(5 * randomFactor); baseResources.stone = Math.floor(3 * randomFactor); baseResources.gold = Math.floor(5 * randomFactor); break;
        case "mountains": baseResources.stone = Math.floor(15 * randomFactor); baseResources.gold = Math.floor(8 * randomFactor); baseResources.wood = Math.floor(3 * randomFactor); baseResources.food = Math.floor(2 * randomFactor); break;
        case "forests": baseResources.wood = Math.floor(15 * randomFactor); baseResources.food = Math.floor(7 * randomFactor); baseResources.stone = Math.floor(3 * randomFactor); baseResources.gold = Math.floor(3 * randomFactor); break;
        case "coast": baseResources.food = Math.floor(12 * randomFactor); baseResources.gold = Math.floor(10 * randomFactor); baseResources.wood = Math.floor(3 * randomFactor); baseResources.stone = Math.floor(2 * randomFactor); break;
        case "capital": baseResources.gold = 20; baseResources.wood = Math.floor(10 * randomFactor); baseResources.stone = Math.floor(10 * randomFactor); baseResources.food = Math.floor(10 * randomFactor); break;
      }
      Object.keys(baseResources).forEach(key => { baseResources[key as keyof Resources] = Math.max(0, baseResources[key as keyof Resources]); });
      return baseResources;
    };

    const getPlayerColor = (index: number): string => {
      const colors = ["#FF5733", "#33A1FF", "#33FF57", "#F333FF", "#FFD433", "#33FFF6"];
      return colors[index % colors.length];
    };

    // --- Actions ---

    const handleTerritorySelect = (territoryId: TerritoryId) => {
      if (!gameState) return;
      const territory = gameState.territories.find(t => t.id === territoryId);
      if (!territory) return;
      const currentAction = gameState.currentAction;
      const currentPlayerId = gameState.currentPlayer;
      const player = gameState.players.find(p => p.id === currentPlayerId);
      if (!player) return;

      console.log(`Territory ${territoryId} clicked. Action: ${currentAction}, Phase: ${gameState.phase}, Sel: ${selectedTerritoryId}`);

      if (gameState.phase === "setup") {
        if (territory.owner === null) handleClaimTerritory(territoryId);
        else toast.error("Territory already claimed.");
      } else if (gameState.phase === "playing") {
        switch (currentAction) {
          case "expand":
            if (gameState.expandableTerritories.includes(territoryId)) handleExpandTerritory(territoryId);
            else toast.error("Cannot expand here.");
            break;
          case "attack":
            if (selectedTerritoryId === null) { // Selecting origin
              if (territory.owner === currentPlayerId && territory.units.length > 0) {
                setSelectedTerritoryId(territoryId);
                updateState(prev => ({ ...prev, attackableTerritories: getAttackableTerritoriesForOrigin(territoryId) }));
                toast.info(`Attacking from T${territoryId}. Select target.`);
              } else toast.error("Select one of your territories with units.");
            } else { // Selecting target
              if (gameState.attackableTerritories.includes(territoryId)) handleAttackTerritory(territoryId);
              else if (territory.owner === currentPlayerId && territory.units.length > 0) { // Change origin
                setSelectedTerritoryId(territoryId);
                updateState(prev => ({ ...prev, attackableTerritories: getAttackableTerritoriesForOrigin(territoryId) }));
                toast.info(`Changed attack origin to T${territoryId}. Select target.`);
              } else { // Invalid target
                toast.error("Invalid attack target.");
                setSelectedTerritoryId(null); // Reset origin
                updateState(prev => ({ ...prev, currentAction: 'none', attackableTerritories: [] }));
              }
            }
            break;
          case "build":
            if (gameState.buildableTerritories.includes(territoryId)) {
              setSelectedTerritoryId(territoryId); setActiveMenu("build");
            } else toast.error("Cannot build here.");
            break;
          case "recruit":
            if (gameState.recruitableTerritories.includes(territoryId)) {
              setSelectedTerritoryId(territoryId); setActiveMenu("recruit");
            } else toast.error("Cannot recruit here (Needs Barracks / Space).");
            break;
          default: // 'none' action
            setSelectedTerritoryId(territory.owner === currentPlayerId ? territoryId : null);
            setActiveMenu(null);
            break;
        }
      }
    };

    const getAttackableTerritoriesForOrigin = (originTerritoryId: TerritoryId | null): TerritoryId[] => {
      if (!gameState || originTerritoryId === null) return [];
      const originTerritory = gameState.territories.find(t => t.id === originTerritoryId);
      if (!originTerritory || originTerritory.owner !== gameState.currentPlayer || originTerritory.units.length === 0) return [];
      return (originTerritory.adjacentTerritories || []).filter(adjId => {
        const adjTerritory = gameState.territories.find(t => t.id === adjId);
        return adjTerritory && adjTerritory.owner !== null && adjTerritory.owner !== gameState.currentPlayer;
      });
    };

    const handleMenuSelect = (menu: "build" | "recruit" | "expand" | "attack") => {
      if (!gameState || gameState.phase !== 'playing') return;

      if (gameState.actionsPerformed[menu]) {
        toast.error(`Action already performed: ${menu}.`);
        return;
      }

      const switchingAction = gameState.currentAction !== 'none' && gameState.currentAction !== menu;
      if (switchingAction) {
        setSelectedTerritoryId(null);
        setActiveMenu(null);
        if (gameState.currentAction === 'attack') {
          updateState(prevState => ({ ...prevState, attackableTerritories: [] }));
        }
      }

      // Optimistically set action, then validate
      updateState(prevState => ({ ...prevState, currentAction: menu }));

      // Fetch the *synchronously* updated state for validation
      // Note: This is a common pattern, but ideally use a state management library or reducer for synchronous updates
      const currentState = gameStateRef.current; // Use a ref to get the latest state if updateState is async
      if (!currentState) return;

      let canProceed = true;
      let infoMessage = "";

      switch (menu) {
        case "expand":
          if (!hasResourcesForExpansion()) {
            toast.error(errorMessages.expand); canProceed = false;
          } else if (currentState.expandableTerritories.length === 0) {
            toast.error(errorMessages.expand); canProceed = false;
          } else infoMessage = "Select an adjacent neutral territory.";
          break;
        case "attack":
          const player = currentState.players.find(p => p.id === currentState.currentPlayer);
          if (!player || player.units.length === 0) {
            toast.error("No units to attack with."); canProceed = false;
          } else {
            const anyAttackPossible = player.territories.some(originId => getAttackableTerritoriesForOrigin(originId).length > 0);
            if (!anyAttackPossible) {
              toast.error("No valid targets from any territory."); canProceed = false;
            } else infoMessage = "Select attacking territory, then target.";
          }
          break;
        case "build":
          if (currentState.buildableTerritories.length === 0) {
            toast.error(errorMessages.build); canProceed = false;
          } else infoMessage = "Select territory to build on.";
          break;
        case "recruit":
          if (currentState.recruitableTerritories.length === 0) {
            toast.error(errorMessages.recruit); canProceed = false;
          } else infoMessage = "Select territory with Barracks.";
          break;
      }

      if (!canProceed) {
        updateState(prevState => ({ ...prevState, currentAction: 'none' })); // Revert action if invalid
      } else if (infoMessage) {
        toast.info(infoMessage);
      }
    };
    // Ref to hold the latest game state for synchronous access in callbacks
    const gameStateRef = useRef(gameState);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);


    // --- Core Game Logic Handlers ---

    const handleClaimTerritory = (territoryId: TerritoryId) => {
      if (!gameStateRef.current || gameStateRef.current.phase !== "setup") return;
      if (territoryClaimInProgress) { toast.info("Claiming..."); return; }

      const territory = gameStateRef.current.territories.find(t => t.id === territoryId);
      const player = gameStateRef.current.players.find(p => p.id === gameStateRef.current?.currentPlayer);

      if (!territory || territory.owner !== null || !player || player.hasSelectedStartingTerritory) {
        toast.error("Invalid selection for setup."); return;
      }

      setTerritoryClaimInProgress(true);

      updateState(prevState => {
        const currentPlayerId = prevState.currentPlayer;
        const updatedTerritories = prevState.territories.map(t =>
          t.id === territoryId ? { ...t, owner: currentPlayerId, type: 'capital' as const } : t
        );
        const updatedPlayers = prevState.players.map(p =>
          p.id === currentPlayerId ? { ...p, territories: [territoryId], hasSelectedStartingTerritory: true } : p
        );
        return { ...prevState, territories: updatedTerritories, players: updatedPlayers }; // Don't set actionTaken here
      });

      toast.success(`Player ${player.name} claimed territory ${territoryId} as capital!`);
      setTimeout(() => { handleEndTurn(); setTerritoryClaimInProgress(false); }, 500);
    };

    const handleExpandTerritory = (territoryId: TerritoryId) => {
      if (!gameStateRef.current || gameStateRef.current.phase !== 'playing' || gameStateRef.current.currentAction !== 'expand') return;

      const cost = { gold: 100, wood: 0, stone: 0, food: 20 };
      const player = gameStateRef.current.players.find(p => p.id === gameStateRef.current?.currentPlayer);
      const territory = gameStateRef.current.territories.find(t => t.id === territoryId);

      if (!player || !territory || territory.owner !== null || !gameStateRef.current.expandableTerritories.includes(territoryId)) {
        toast.error("Invalid expansion target."); return;
      }
      if (player.resources.gold < cost.gold || player.resources.food < cost.food) {
        toast.error(`Need ${cost.gold} Gold, ${cost.food} Food.`); return;
      }

      updateState(prevState => {
        const currentPlayerId = prevState.currentPlayer;
        const updatedTerritories = prevState.territories.map(t =>
          t.id === territoryId ? { ...t, owner: currentPlayerId } : t
        );
        const updatedPlayers = prevState.players.map(p =>
          p.id === currentPlayerId ? { ...p, territories: [...p.territories, territoryId], resources: { ...p.resources, gold: p.resources.gold - cost.gold, food: p.resources.food - cost.food } } : p
        );
        return { ...prevState, territories: updatedTerritories, players: updatedPlayers, actionsPerformed: { ...prevState.actionsPerformed, expand: true }, currentAction: 'none', expandableTerritories: [] };
      });
      toast.success(`Expanded to territory ${territoryId}!`);
      setSelectedTerritoryId(null);
      // updateActionableTerritories(); // Let useEffect handle this
    };

    const handleBuildStructure = (buildingTypeString: string) => {
      if (!gameStateRef.current || selectedTerritoryId === null || gameStateRef.current.phase !== 'playing' || gameStateRef.current.currentAction !== 'build') return;

      const buildingType = buildingTypeString as BuildingType;
      const buildingDef = BUILDING_DEFINITIONS[buildingType];
      if (!buildingDef) { toast.error("Invalid building."); return; }

      const player = gameStateRef.current.players.find(p => p.id === gameStateRef.current?.currentPlayer);
      const territory = gameStateRef.current.territories.find(t => t.id === selectedTerritoryId);

      if (!player || !territory || territory.owner !== player.id) { toast.error("Cannot build here."); return; }
      if (territory.buildings.length > 0) { toast.error("Building slot occupied."); return; } // Simple 1 building rule

      const cost = buildingDef.cost;
      if (player.resources.gold < cost.gold || player.resources.wood < cost.wood || player.resources.stone < cost.stone || player.resources.food < cost.food) {
        toast.error(`Need: ${Object.entries(cost).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ')}`); return;
      }

      updateState(prevState => {
        const newBuildingId: BuildingId = Date.now() + Math.random();
        const newBuilding: GameBuilding = { id: newBuildingId, type: buildingType, territoryId: selectedTerritoryId };
        const updatedTerritories = prevState.territories.map(t => t.id === selectedTerritoryId ? { ...t, buildings: [...t.buildings, newBuildingId] } : t);
        const updatedPlayers = prevState.players.map(p => p.id === player.id ? { ...p, resources: { gold: p.resources.gold - cost.gold, wood: p.resources.wood - cost.wood, stone: p.resources.stone - cost.stone, food: p.resources.food - cost.food }, buildings: [...p.buildings, newBuilding] } : p);
        return { ...prevState, territories: updatedTerritories, players: updatedPlayers, actionsPerformed: { ...prevState.actionsPerformed, build: true }, currentAction: 'none' };
      });
      toast.success(`${buildingDef.name} built!`);
      setActiveMenu(null); setSelectedTerritoryId(null);
      // updateActionableTerritories(); // Let useEffect handle this
    };

    const handleRecruitUnit = (unitTypeString: string) => {
      if (!gameStateRef.current || selectedTerritoryId === null || gameStateRef.current.phase !== 'playing' || gameStateRef.current.currentAction !== 'recruit') return;

      const unitType = unitTypeString as UnitType;
      const unitDef = UNIT_DEFINITIONS[unitType];
      if (!unitDef) { toast.error("Invalid unit."); return; }

      const player = gameStateRef.current.players.find(p => p.id === gameStateRef.current?.currentPlayer);
      const territory = gameStateRef.current.territories.find(t => t.id === selectedTerritoryId);

      if (!player || !territory || territory.owner !== player.id) { toast.error("Cannot recruit here."); return; }
      const hasBarracks = territory.buildings.some(bId => player.buildings.find(b => b.id === bId)?.type === 'barracks');
      if (!hasBarracks) { toast.error("Requires Barracks."); return; }
      if (territory.units.length > 0) { toast.error("Territory occupied."); return; } // Simple 1 unit rule

      const cost = unitDef.cost;
      if (player.resources.gold < cost.gold || player.resources.wood < cost.wood || player.resources.stone < cost.stone || player.resources.food < cost.food) {
        toast.error(`Need: ${Object.entries(cost).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ')}`); return;
      }

      updateState(prevState => {
        const newUnitId: UnitId = Date.now() + Math.random();
        // Ensure GameUnit type matches src/types/game.ts
        const newUnit: GameUnit = {
          id: newUnitId,
          type: unitType,
          territoryId: selectedTerritoryId,
          ownerId: player.id, // Assign owner
          health: unitDef.health,
          maxHealth: unitDef.health,
          experience: 0,
          level: 1,
          attack: unitDef.attack, // <<< Make sure this uses .attack
          defense: unitDef.defense, // <<< Make sure this uses .defense
          // hasMoved: false, // Add if defined in GameUnit
        };
        const updatedTerritories = prevState.territories.map(t => t.id === selectedTerritoryId ? { ...t, units: [...t.units, newUnitId] } : t);
        const updatedPlayers = prevState.players.map(p => p.id === player.id ? { ...p, resources: { gold: p.resources.gold - cost.gold, wood: p.resources.wood - cost.wood, stone: p.resources.stone - cost.stone, food: p.resources.food - cost.food }, units: [...p.units, newUnit] } : p);
        return { ...prevState, territories: updatedTerritories, players: updatedPlayers, actionsPerformed: { ...prevState.actionsPerformed, recruit: true }, currentAction: 'none' };
      });

      toast.success(`${unitDef.name} recruited!`);
      setActiveMenu(null); setSelectedTerritoryId(null);
      // updateActionableTerritories(); // Let useEffect handle this
    };

    const handleAttackTerritory = (defendingTerritoryId: TerritoryId) => {
      if (!gameStateRef.current || selectedTerritoryId === null || gameStateRef.current.phase !== 'playing' || gameStateRef.current.currentAction !== 'attack') return;

      const attackingTerritory = gameStateRef.current.territories.find(t => t.id === selectedTerritoryId);
      const defendingTerritory = gameStateRef.current.territories.find(t => t.id === defendingTerritoryId);
      const attackingPlayer = gameStateRef.current.players.find(p => p.id === gameStateRef.current?.currentPlayer);

      if (!attackingTerritory || !defendingTerritory || !attackingPlayer) { toast.error("Invalid attack."); return; }
      if (defendingTerritory.owner === attackingPlayer.id) { toast.error("Cannot attack own territory."); return; }
      if (attackingTerritory.units.length === 0) { toast.error("No units to attack with."); setSelectedTerritoryId(null); updateState(prevState => ({ ...prevState, currentAction: 'none', attackableTerritories: [] })); return; }
      if (!attackingTerritory.adjacentTerritories?.includes(defendingTerritoryId)) { toast.error("Target not adjacent."); return; }

      // --- Combat Logic ---
      let attackerStrength = 0; attackingTerritory.units.forEach(unitId => { const u = attackingPlayer.units.find(un => un.id === unitId); if (u) attackerStrength += u.attack * (u.health / u.maxHealth) * (1 + (u.level ?? 1) * 0.05); });
      let defenderStrength = 5; const defendingPlayer = defendingTerritory.owner !== null ? gameStateRef.current.players.find(p => p.id === defendingTerritory.owner) : null;
      if (defendingPlayer) {
        defendingTerritory.units.forEach(unitId => { const u = defendingPlayer.units.find(un => un.id === unitId); if (u) defenderStrength += u.defense * (u.health / u.maxHealth) * (1 + (u.level ?? 1) * 0.05); });
        defendingTerritory.buildings.forEach(bId => { const b = defendingPlayer.buildings.find(bu => bu.id === bId); if (b?.type === 'fortress') defenderStrength *= 1.25; if (b?.type === 'castle') defenderStrength *= 1.35; });
      }
      const randomFactor = () => 0.8 + Math.random() * 0.4; const attackerRoll = attackerStrength * randomFactor(); const defenderRoll = defenderStrength * randomFactor(); const attackerWins = attackerRoll > defenderRoll;
      const damageMultiplier = 20; let combatMessage = `Attack T${selectedTerritoryId}->T${defendingTerritoryId}. Roll:${attackerRoll.toFixed(0)} vs ${defenderRoll.toFixed(0)}. `;

      updateState(prevState => {
        let newTerritories = [...prevState.territories]; let newPlayers = [...prevState.players]; const attackerPlayerId = prevState.currentPlayer; const defendingPlayerId = defendingTerritory.owner;
        const damageToAttacker = attackerWins ? Math.max(1, Math.floor(defenderRoll / damageMultiplier)) : Math.max(2, Math.floor(defenderRoll / (damageMultiplier * 0.6)));
        const damageToDefender = attackerWins ? Math.max(2, Math.floor(attackerRoll / (damageMultiplier * 0.6))) : Math.max(1, Math.floor(attackerRoll / damageMultiplier));
        let attackerUnitsSurvived = true; let defenderUnitsSurvived = true; let unitsInAttackingTerritoryIds = [...attackingTerritory.units]; let unitsInDefendingTerritoryIds = [...defendingTerritory.units];

        newPlayers = newPlayers.map(p => {
          let playerUnits = [...p.units]; let playerBuildings = [...p.buildings];
          if (p.id === attackerPlayerId) {
            let survivingUnitIds: UnitId[] = [];
            playerUnits = playerUnits.map(u => u && unitsInAttackingTerritoryIds.includes(u.id) ? (u.health - damageToAttacker > 0 ? (survivingUnitIds.push(u.id), { ...u, health: u.health - damageToAttacker, experience: u.experience + (attackerWins ? 10 : 2) }) : null) : u).filter(u => u !== null) as GameUnit[];
            unitsInAttackingTerritoryIds = survivingUnitIds; if (unitsInAttackingTerritoryIds.length === 0) attackerUnitsSurvived = false;
          }
          if (p.id === defendingPlayerId) {
            let survivingUnitIds: UnitId[] = [];
            playerUnits = playerUnits.map(u => u && unitsInDefendingTerritoryIds.includes(u.id) ? (u.health - damageToDefender > 0 ? (survivingUnitIds.push(u.id), { ...u, health: u.health - damageToDefender, experience: u.experience + (attackerWins ? 1 : 5) }) : null) : u).filter(u => u !== null) as GameUnit[];
            unitsInDefendingTerritoryIds = survivingUnitIds; if (unitsInDefendingTerritoryIds.length === 0) defenderUnitsSurvived = false;
            if (attackerWins && !defenderUnitsSurvived) { playerBuildings = playerBuildings.filter(b => b.territoryId !== defendingTerritoryId); combatMessage += ` Buildings destroyed! `; }
          } return { ...p, units: playerUnits, buildings: playerBuildings };
        });

        newTerritories = newTerritories.map(t => {
          if (t.id === selectedTerritoryId) return { ...t, units: unitsInAttackingTerritoryIds };
          if (t.id === defendingTerritoryId) {
            if (attackerWins && !defenderUnitsSurvived) { combatMessage += `Territory ${defendingTerritoryId} captured!`; return { ...t, owner: attackerPlayerId, units: [], buildings: [] }; }
            else return { ...t, units: unitsInDefendingTerritoryIds };
          } return t;
        });

        if (attackerWins && !defenderUnitsSurvived) {
          newPlayers = newPlayers.map(p => {
            if (p.id === attackerPlayerId && !p.territories.includes(defendingTerritoryId)) return { ...p, territories: [...p.territories, defendingTerritoryId] };
            if (p.id === defendingPlayerId) return { ...p, territories: p.territories.filter(id => id !== defendingTerritoryId) };
            return p;
          });
        }

        return { ...prevState, territories: newTerritories, players: newPlayers, actionsPerformed: { ...prevState.actionsPerformed, attack: true }, currentAction: 'none', attackableTerritories: [] };
      });
      toast.info(combatMessage);
      setSelectedTerritoryId(null);
      // updateActionableTerritories(); // Let useEffect handle this
    };


    const collectResources = (playerId: PlayerId): { updatedPlayers: GamePlayer[]; resourceGain: ResourceGain, updatedTerritories?: Territory[] } => {
      const currentState = gameStateRef.current; // Use ref for latest state
      if (!currentState) return { updatedPlayers: [], resourceGain: { gold: 0, wood: 0, stone: 0, food: 0 } };

      const player = currentState.players.find(p => p.id === playerId);
      if (!player) return { updatedPlayers: [...currentState.players], resourceGain: { gold: 0, wood: 0, stone: 0, food: 0 } };

      const resourceGain: ResourceGain = { gold: 0, wood: 0, stone: 0, food: 0 };
      let foodUpkeep = 0;

      player.territories.forEach(territoryId => {
        const territory = currentState.territories.find(t => t.id === territoryId);
        if (!territory) return;
        resourceGain.gold += territory.resources.gold; resourceGain.wood += territory.resources.wood; resourceGain.stone += territory.resources.stone; resourceGain.food += territory.resources.food;
        if (territory.type === 'capital') { resourceGain.gold += 5; resourceGain.wood += 5; resourceGain.stone += 5; resourceGain.food += 5; }
        territory.buildings.forEach(buildingId => {
          const building = player.buildings.find(b => b.id === buildingId);
          if (building) { const def = BUILDING_DEFINITIONS[building.type]; if (def?.bonus) { if (def.bonus.includes("Wood")) resourceGain.wood += 20; if (def.bonus.includes("Stone")) resourceGain.stone += 20; if (def.bonus.includes("Gold")) resourceGain.gold += 20; if (def.bonus.includes("Food")) resourceGain.food += 8; } }
        });
      });
      player.units.forEach(unit => { const def = UNIT_DEFINITIONS[unit.type]; if (def) foodUpkeep += def.upkeep; });

      const netFoodGain = resourceGain.food - foodUpkeep;
      const foodDeficit = netFoodGain < 0 ? Math.abs(netFoodGain) : 0;
      const updatedResources = { gold: player.resources.gold + resourceGain.gold, wood: player.resources.wood + resourceGain.wood, stone: player.resources.stone + resourceGain.stone, food: Math.max(0, player.resources.food + netFoodGain) };

      let updatedUnits = [...player.units]; let territoryUnitsNeedUpdate = false; let returnUpdatedTerritories = [...currentState.territories];
      if (foodDeficit > 0) {
        toast.warning(`${player.name} has a food deficit of ${foodDeficit}!`); const penalty = 5; let died = false;
        updatedUnits = updatedUnits.map(u => u.health - penalty <= 0 ? (died = true, null) : ({ ...u, health: u.health - penalty })).filter(u => u !== null) as GameUnit[];
        if (died) {
          territoryUnitsNeedUpdate = true; toast.error(`${player.name} lost units to starvation!`); const survivingIds = new Set(updatedUnits.map(u => u.id));
          returnUpdatedTerritories = returnUpdatedTerritories.map(t => t.owner === playerId ? { ...t, units: t.units.filter(id => survivingIds.has(id)) } : t);
        }
      }
      const updatedPlayers = currentState.players.map(p => p.id === playerId ? { ...p, resources: updatedResources, units: updatedUnits } : p);
      const finalGain: ResourceGain = { gold: resourceGain.gold, wood: resourceGain.wood, stone: resourceGain.stone, food: netFoodGain };
      return { updatedPlayers, resourceGain: finalGain, updatedTerritories: territoryUnitsNeedUpdate ? returnUpdatedTerritories : undefined };
    };


    const handleEndTurn = () => {
      const currentState = gameStateRef.current; // Use ref
      if (!currentState) return;

      if (currentState.phase === "setup") {
        const player = currentState.players.find(p => p.id === currentState.currentPlayer);
        if (!player || !player.hasSelectedStartingTerritory) { toast.error("Claim starting territory!"); return; }
        const currentIdx = currentState.players.findIndex(p => p.id === currentState.currentPlayer);
        const nextPlayerIndex = (currentIdx + 1) % currentState.players.length;
        const nextPlayerId = currentState.players[nextPlayerIndex].id;
        const allSelected = currentState.players.every(p => p.hasSelectedStartingTerritory);
        const setupComplete = nextPlayerIndex === 0 && allSelected;
        updateState(prev => ({ ...prev, currentPlayer: nextPlayerId, phase: setupComplete ? "playing" : "setup", turn: setupComplete ? 1 : prev.turn, setupComplete: setupComplete, actionsPerformed: { build: false, recruit: false, expand: false, attack: false } }));
        if (setupComplete) { toast.success("Setup complete! Game starts."); handleResourceCollectionForPlayer(0); }
        else { const nextP = currentState.players.find(p => p.id === nextPlayerId); if (nextP) toast.info(`Player ${nextP.name}'s turn.`); }
        setSelectedTerritoryId(null); setActiveMenu(null); return;
      }

      if (currentState.phase === "playing") {
        const currentIdx = currentState.players.findIndex(p => p.id === currentState.currentPlayer);
        const nextPlayerIndex = (currentIdx + 1) % currentState.players.length;
        const nextPlayerId = currentState.players[nextPlayerIndex].id;
        const nextTurn = nextPlayerIndex === 0 ? currentState.turn + 1 : currentState.turn;
        const { winnerId, victoryType } = checkVictoryConditions(currentState.players, currentState.territories);

        if (winnerId !== null) {
          updateState(prev => ({ ...prev, gameOver: true, winner: winnerId, phase: 'completed', victoryType: victoryType }));
          const winnerP = currentState.players.find(p => p.id === winnerId); if (winnerP) toast.success(`${winnerP.name} wins by ${victoryType}!`);
          return;
        }
        updateState(prev => ({ ...prev, turn: nextTurn, currentPlayer: nextPlayerId, gameOver: false, winner: null, currentAction: "none", expandableTerritories: [], attackableTerritories: [], buildableTerritories: [], recruitableTerritories: [], actionsPerformed: { build: false, recruit: false, expand: false, attack: false } }));
        setSelectedTerritoryId(null); setActiveMenu(null);
        handleResourceCollectionForPlayer(nextPlayerId);
      }
    };

    const handleResourceCollectionForPlayer = (playerId: PlayerId) => {
      const currentState = gameStateRef.current; // Use ref
      if (!currentState) return;
      console.log(`Collecting resources for Player ${playerId}`);
      const { updatedPlayers, resourceGain, updatedTerritories } = collectResources(playerId);
      updateState(prev => ({ ...prev, players: updatedPlayers, territories: updatedTerritories ?? prev.territories, lastResourceGain: resourceGain }));
      if (resourceGain && Object.values(resourceGain).some(v => v !== 0)) {
        setShowResourceGain(true); setTimeout(() => setShowResourceGain(false), 3000);
      }
    };


    const checkVictoryConditions = (players: GamePlayer[], territories: Territory[]): { winnerId: PlayerId | null; victoryType: VictoryType | null } => {
      const totalTerritories = territories.length;
      if (totalTerritories === 0) return { winnerId: null, victoryType: null };

      for (const player of players) {
        if (player.territories.length === 0 && players.filter(p => p.territories.length > 0).length > 1) continue;
        if (player.territories.length / totalTerritories >= 0.75) return { winnerId: player.id, victoryType: 'domination' };
        if (player.resources.gold >= 10000) return { winnerId: player.id, victoryType: 'economic' };
        let capturedAllCapitals = true;
        for (const other of players) {
          if (other.id === player.id || other.territories.length === 0) continue;
          const enemyCapId = other.territories[0]; const enemyCap = territories.find(t => t.id === enemyCapId && t.type === 'capital');
          if (enemyCap && enemyCap.owner !== player.id) { capturedAllCapitals = false; break; }
          else if (!enemyCap && other.territories.length > 0) { capturedAllCapitals = false; break; }
        }
        const activeOpps = players.filter(p => p.id !== player.id && p.territories.length > 0).length;
        if (capturedAllCapitals && activeOpps > 0) return { winnerId: player.id, victoryType: 'military' };
      }
      const activePlayers = players.filter(p => p.territories.length > 0);
      if (activePlayers.length === 1 && players.length > 1) return { winnerId: activePlayers[0].id, victoryType: 'domination' };
      return { winnerId: null, victoryType: null };
    };

    const handleNewGame = () => { window.location.reload(); };


    // --- Rendering ---
    if (loading || !gameState) { return <LoadingScreen message="Loading Game..." />; }
    if (error) { return <ErrorScreen message={error} onBack={() => window.location.reload()} />; }

    const winnerPlayer = gameState.winner !== null ? gameState.players.find(p => p.id === gameState.winner) : null;
    if (gameState.gameOver && winnerPlayer) {
      return (
        <VictoryScreen
          winner={{
            ...winnerPlayer,
            buildings: {
              count: {
                fortress: winnerPlayer.buildings.filter(b => b.type === 'fortress').length,
                farm: winnerPlayer.buildings.filter(b => b.type === 'farm').length,
                mine: winnerPlayer.buildings.filter(b => b.type === 'mine').length,
                lumbermill: winnerPlayer.buildings.filter(b => b.type === 'lumberMill').length,
                market: winnerPlayer.buildings.filter(b => b.type === 'market').length,
                barracks: winnerPlayer.buildings.filter(b => b.type === 'barracks').length,
                watchtower: winnerPlayer.buildings.filter(b => b.type === 'watchtower').length,
                castle: winnerPlayer.buildings.filter(b => b.type === 'castle').length,
              },
            },
          }}
          victoryType={gameState.victoryType ?? 'domination'}
          onNewGame={handleNewGame}
          onExitToMenu={onExitGame}
        />
      );
    }

    const renderPhase = () => { /* ... existing renderPhase logic ... */ return null; }; // Keep it simple for now or reimplement if needed
    const renderResourceGainToast = () => { /* ... existing renderResourceGainToast logic ... */ return null; }; // Keep simple
    const renderPositionedMenu = () => { /* ... existing renderPositionedMenu logic ... */ return null; }; // Keep simple

    const currentPlayerObj = gameState.players.find(p => p.id === gameState.currentPlayer);

    return (
      <div className="relative h-full w-full flex flex-col bg-gray-900 text-white">
        <GameTopBar
          turn={gameState.turn}
          currentPlayer={gameState.currentPlayer}
          playerName={currentPlayerObj?.name ?? 'N/A'}
          playerColor={currentPlayerObj?.color ?? '#FFFFFF'}
          onExitGame={onExitGame}
          phase={gameState.phase}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative" ref={mapContainerRef}>
            <GameBoard
              territories={gameState.territories}
              players={gameState.players}
              selectedTerritory={selectedTerritoryId}
              onTerritorySelect={handleTerritorySelect}
              onClaimTerritory={handleClaimTerritory}
              onAttackTerritory={(targetId) => handleAttackTerritory(targetId)}
              currentPlayer={gameState.currentPlayer}
              phase={gameState.phase}
              actionTaken={false} // Deprecated
              expandableTerritories={gameState.expandableTerritories}
              attackableTerritories={gameState.attackableTerritories}
              buildableTerritories={gameState.buildableTerritories}
              recruitableTerritories={gameState.recruitableTerritories}
              currentAction={gameState.currentAction}
              actionsPerformed={gameState.actionsPerformed}
            />
            {/* {renderPhase()} */}
            {/* {renderResourceGainToast()} */}
            {/* {renderPositionedMenu()} */}
          </div>

          {!isMobile && currentPlayerObj && (
            <div className="w-72 p-4 flex flex-col bg-gray-800 border-l border-gray-700 overflow-y-auto">
              <ResourceDisplay resources={currentPlayerObj.resources} />
              <div className="my-4 border-t border-gray-700"></div>
              {gameState.phase === "playing" && (
                <GameControls
                  onBuildClick={() => handleMenuSelect("build")}
                  onRecruitClick={() => handleMenuSelect("recruit")}
                  onExpandClick={() => handleMenuSelect("expand")}
                  onAttackClick={() => handleMenuSelect("attack")}
                  onEndTurnClick={handleEndTurn}
                  disabled={false}
                  actionTaken={false} // Deprecated
                  expandMode={gameState.currentAction === "expand"}
                  attackMode={gameState.currentAction === "attack"}
                  canAttack={currentPlayerObj.units.length > 0 && (gameState.attackableTerritories.length > 0 || getAttackableTerritoriesForOrigin(selectedTerritoryId).length > 0)}
                  hasResourcesForExpansion={hasResourcesForExpansion()}
                  canRecruit={gameState.recruitableTerritories.length > 0}
                  canBuild={gameState.buildableTerritories.length > 0}
                  actionsPerformed={gameState.actionsPerformed}
                  errorMessages={errorMessages}
                />
              )}
              <GameMenus onInfoButtonClick={type => setActiveInfoModal(type)} />
            </div>
          )}
        </div>

        {isMobile && gameState.phase === "playing" && currentPlayerObj && (
          <div className="bg-gray-800 p-2 border-t border-gray-700">
            <ResourceDisplay resources={currentPlayerObj.resources} compact={true} />
            <div className="mt-2">
              <GameControls
                onBuildClick={() => handleMenuSelect("build")}
                onRecruitClick={() => handleMenuSelect("recruit")}
                onExpandClick={() => handleMenuSelect("expand")}
                onAttackClick={() => handleMenuSelect("attack")}
                onEndTurnClick={handleEndTurn}
                disabled={false}
                actionTaken={false} // Deprecated
                expandMode={gameState.currentAction === "expand"}
                attackMode={gameState.currentAction === "attack"}
                canAttack={currentPlayerObj.units.length > 0 && (gameState.attackableTerritories.length > 0 || getAttackableTerritoriesForOrigin(selectedTerritoryId).length > 0)}
                hasResourcesForExpansion={hasResourcesForExpansion()}
                canRecruit={gameState.recruitableTerritories.length > 0}
                canBuild={gameState.buildableTerritories.length > 0}
                actionsPerformed={gameState.actionsPerformed}
                errorMessages={errorMessages}
              />
            </div>
          </div>
        )}

        {isMobile && activeMenu && selectedTerritoryId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold text-lg">
                  {activeMenu === "build" ? "Build Structure" : "Recruit Unit"}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveMenu(null)} className="text-gray-300 hover:text-white p-1">✕</Button>
              </div>
              {activeMenu === "build" && <BuildingMenu onSelect={handleBuildStructure} />}
              {activeMenu === "recruit" && <RecruitmentMenu onSelect={handleRecruitUnit} />}
            </div>
          </div>
        )}

        {activeInfoModal && <GameInfoModal type={activeInfoModal} onClose={() => setActiveInfoModal(null)} />}
      </div>
    );
  };