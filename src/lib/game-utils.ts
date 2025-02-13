
import { Territory, Resources, GameState, PlayerColor } from "@/types/game";
import { Json } from "@/integrations/supabase/types";

export const generateInitialTerritories = (boardSize: number): Territory[] => {
  const territories: Territory[] = [];
  // Increase radius based on number of players for larger boards
  const radius = Math.floor(Math.sqrt(boardSize) / 2);

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      if (territories.length < boardSize) {
        const resources: Partial<Resources> = {};
        const resourceTypes = ['gold', 'wood', 'stone', 'food'] as const;
        
        // Increase number of resources per territory
        const numResources = Math.floor(Math.random() * 2) + 2; // 2-3 resources per territory
        const selectedResources = [...resourceTypes]
          .sort(() => Math.random() - 0.5)
          .slice(0, numResources);
        
        selectedResources.forEach(resource => {
          resources[resource] = Math.floor(Math.random() * 4) + 2; // 2-5 resources per type
        });

        territories.push({
          id: `${q},${r},${s}`,
          type: "plains",
          owner: null,
          coordinates: { q, r, s },
          resources,
        });
      }
    }
  }

  return territories;
};

export const createInitialGameState = (numPlayers: number, boardSize: number): GameState => {
  // Scale board size based on number of players
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
    })),
    territories: generateInitialTerritories(scaledBoardSize),
    currentPlayer: "player1",
    phase: "setup",
    turn: 1,
    updates: [],
  };
};
