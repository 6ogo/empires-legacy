
import { MilitaryUnit } from "@/types/game";

export const militaryUnits: Record<string, MilitaryUnit> = {
  infantry: {
    type: "infantry",
    health: 50,
    damage: 30,
    cost: {
      gold: 50,
      food: 20
    }
  },
  cavalry: {
    type: "cavalry",
    health: 75,
    damage: 45,
    cost: {
      gold: 100,
      food: 40
    }
  },
  archers: {
    type: "archers",
    health: 40,
    damage: 50,
    cost: {
      gold: 75,
      wood: 30,
      food: 25
    }
  },
  siege: {
    type: "siege",
    health: 100,
    damage: 100,
    cost: {
      gold: 200,
      wood: 50,
      stone: 50,
      food: 50
    }
  }
};
