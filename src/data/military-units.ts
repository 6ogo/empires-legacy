// src/data/military-units.ts

import { TerrainType } from "@/types/game";

export interface UnitModifiers {
  terrainBonuses: Partial<Record<TerrainType, number>>;
  attackModifiers: {
    vsInfantry: number;
    vsCavalry: number;
    vsArcher: number;
  };
  specialAbilities: string[];
}

export interface EnhancedMilitaryUnit {
  type: string;
  health: number;
  damage: number;
  experience: number;
  hasMoved: boolean;
  cost: {
    gold?: number;
    wood?: number;
    stone?: number;
    food?: number;
  };
  modifiers: UnitModifiers;
  description: string;
}

export const militaryUnits: Record<string, EnhancedMilitaryUnit> = {
  INFANTRY: {
    type: 'infantry',
    health: 100,
    damage: 30,
    experience: 0,
    hasMoved: false,
    cost: {
      gold: 100,
      food: 50
    },
    modifiers: {
      terrainBonuses: {
        forest: 0.2,    // +20% in forests
        hills: 0.1,     // +10% in hills
        mountains: -0.1 // -10% in mountains
      },
      attackModifiers: {
        vsInfantry: 1.0,  // Normal damage vs infantry
        vsCavalry: 1.2,   // +20% vs cavalry
        vsArcher: 1.5     // +50% vs archers
      },
      specialAbilities: [
        'shield_wall',    // Reduces damage taken when adjacent to other infantry
        'fortify'         // Can entrench for additional defense
      ]
    },
    description: 'Versatile melee unit with good defense and anti-cavalry capabilities'
  },

  CAVALRY: {
    type: 'cavalry',
    health: 80,
    damage: 40,
    experience: 0,
    hasMoved: false,
    cost: {
      gold: 150,
      food: 75
    },
    modifiers: {
      terrainBonuses: {
        plains: 0.3,     // +30% in plains
        forest: -0.2,    // -20% in forests
        mountains: -0.3  // -30% in mountains
      },
      attackModifiers: {
        vsInfantry: 1.0,  // Normal damage vs infantry
        vsCavalry: 1.0,   // Normal damage vs cavalry
        vsArcher: 1.8     // +80% vs archers
      },
      specialAbilities: [
        'charge',         // Bonus damage on first attack
        'mobility'        // Can move after attacking
      ]
    },
    description: 'Fast moving unit excellent at hunting archers and flanking enemies'
  },

  ARCHER: {
    type: 'archer',
    health: 60,
    damage: 35,
    experience: 0,
    hasMoved: false,
    cost: {
      gold: 125,
      wood: 50
    },
    modifiers: {
      terrainBonuses: {
        hills: 0.3,      // +30% on hills
        forest: 0.2,     // +20% in forests
        plains: -0.1     // -10% in plains
      },
      attackModifiers: {
        vsInfantry: 1.5,  // +50% vs infantry
        vsCavalry: 0.7,   // -30% vs cavalry
        vsArcher: 1.0     // Normal damage vs archers
      },
      specialAbilities: [
        'range_attack',   // Can attack without taking counter-damage
        'high_ground'     // Extra damage bonus from elevation
      ]
    },
    description: 'Ranged unit that excels at attacking from elevated positions'
  }
} as const;

// Helper functions to calculate unit effectiveness
export const calculateUnitEffectiveness = (
  unit: EnhancedMilitaryUnit,
  terrain: TerrainType,
  targetUnit: EnhancedMilitaryUnit
): number => {
  let effectiveness = 1.0;

  // Apply terrain bonuses
  if (unit.modifiers.terrainBonuses[terrain]) {
    effectiveness *= (1 + unit.modifiers.terrainBonuses[terrain]!);
  }

  // Apply unit type modifiers
  switch (targetUnit.type) {
    case 'infantry':
      effectiveness *= unit.modifiers.attackModifiers.vsInfantry;
      break;
    case 'cavalry':
      effectiveness *= unit.modifiers.attackModifiers.vsCavalry;
      break;
    case 'archer':
      effectiveness *= unit.modifiers.attackModifiers.vsArcher;
      break;
  }

  return effectiveness;
};

// Helper to check if unit has a specific ability
export const hasAbility = (
  unit: EnhancedMilitaryUnit,
  ability: string
): boolean => {
  return unit.modifiers.specialAbilities.includes(ability);
};

// Helper to get terrain bonus for a unit
export const getTerrainBonus = (
  unit: EnhancedMilitaryUnit,
  terrain: TerrainType
): number => {
  return unit.modifiers.terrainBonuses[terrain] || 0;
};
