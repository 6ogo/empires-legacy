
import { Territory, Resources, GameState, PlayerColor, MilitaryUnit } from "@/types/game";
import { Json } from "@/integrations/supabase/types";

export const generateInitialTerritories = (boardSize: number): Territory[] => {
  const territories: Territory[] = [];
  const radius = Math.floor(Math.sqrt(boardSize) / 2);

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      if (territories.length < boardSize) {
        const resources: Partial<Resources> = {};
        const resourceTypes = ['gold', 'wood', 'stone', 'food'] as const;
        
        const numResources = Math.floor(Math.random() * 2) + 2;
        const selectedResources = [...resourceTypes]
          .sort(() => Math.random() - 0.5)
          .slice(0, numResources);
        
        selectedResources.forEach(resource => {
          resources[resource] = Math.floor(Math.random() * 4) + 2;
        });

        territories.push({
          id: `${q},${r},${s}`,
          type: "plains",
          owner: null,
          coordinates: { q, r, s },
          resources,
          totalResourceYield: resources,
        });
      }
    }
  }

  return territories;
};

export const calculateTotalResourceYield = (territory: Territory): Partial<Resources> => {
  const baseResources = { ...territory.resources };
  const totalYield: Partial<Resources> = {};

  // Add base resources
  Object.entries(baseResources).forEach(([resource, amount]) => {
    totalYield[resource as keyof Resources] = amount as number;
  });

  // Add building bonuses
  if (territory.building) {
    switch (territory.building) {
      case 'lumber_mill':
        totalYield.wood = (totalYield.wood || 0) + 20;
        break;
      case 'mine':
        totalYield.stone = (totalYield.stone || 0) + 20;
        break;
      case 'market':
        totalYield.gold = (totalYield.gold || 0) + 20;
        break;
      case 'farm':
        totalYield.food = (totalYield.food || 0) + 8;
        break;
    }
  }

  return totalYield;
};

export const createInitialGameState = (numPlayers: number, boardSize: number): GameState => {
  const scaledBoardSize = Math.max(boardSize, numPlayers * 12);

  return {
    players: Array.from({ length: numPlayers }, (_, i) => ({
      id: `player${i + 1}` as PlayerColor,
      resources: {
        gold: 100,
        wood: 50,
        stone: 50,
        food: 50
      },
      units: {
        infantry: 0,
        cavalry: 0,
        artillery: 0
      },
      territories: [],
      hasExpandedThisTurn: false,
      hasRecruitedThisTurn: false,
    })),
    territories: generateInitialTerritories(scaledBoardSize),
    currentPlayer: "player1",
    phase: "build",
    turn: 1,
    updates: [],
    hasExpandedThisTurn: false,
    hasRecruitedThisTurn: false,
  };
};

export const isAdjacent = (t1: Territory, t2: Territory): boolean => {
  const dx = Math.abs(t1.coordinates.q - t2.coordinates.q);
  const dy = Math.abs(t1.coordinates.r - t2.coordinates.r);
  const ds = Math.abs((t1.coordinates.q + t1.coordinates.r) - (t2.coordinates.q + t2.coordinates.r));
  return (dx <= 1 && dy <= 1 && ds <= 1) && !(dx === 0 && dy === 0);
};

export const hasAdjacentOpponentTerritory = (territory: Territory, territories: Territory[]): boolean => {
  return territories.some(t => 
    t.owner && 
    t.owner !== territory.owner && 
    isAdjacent(t, territory)
  );
};

export const calculateRestoreCost = (unit: MilitaryUnit): Partial<Resources> => {
  const baseCost = unit.cost;
  const restorationCost: Partial<Resources> = {};

  Object.entries(baseCost).forEach(([resource, amount]) => {
    restorationCost[resource as keyof Resources] = Math.floor((amount as number) * 0.5);
  });

  return restorationCost;
};
