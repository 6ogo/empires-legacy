import { GameState, Territory, MilitaryUnit } from '@/types/game';

export class CombatManager {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  calculateAttackDamage(attacker: MilitaryUnit, defender: MilitaryUnit, terrain: string): number {
    const baseDamage = attacker.damage;
    const terrainModifier = this.getTerrainModifier(terrain);
    const experienceModifier = 1 + (attacker.experience * 0.1);
    
    return Math.floor(baseDamage * terrainModifier * experienceModifier);
  }

  calculateDefenseDamage(defender: MilitaryUnit, attacker: MilitaryUnit): number {
    const baseDamage = defender.damage * 0.5;
    const experienceModifier = 1 + (defender.experience * 0.1);
    
    return Math.floor(baseDamage * experienceModifier);
  }

  private getTerrainModifier(terrain: string): number {
    switch (terrain) {
      case 'mountains':
        return 0.7;
      case 'forest':
        return 0.8;
      case 'hills':
        return 0.9;
      case 'plains':
        return 1.0;
      case 'river':
        return 1.2;
      default:
        return 1.0;
    }
  }

  resolveCombat(attackingTerritory: Territory, defendingTerritory: Territory): {
    attackerSurvived: boolean;
    defenderSurvived: boolean;
    attackerDamage: number;
    defenderDamage: number;
  } {
    if (!attackingTerritory.militaryUnit || !defendingTerritory.militaryUnit) {
      throw new Error('Both territories must have military units to resolve combat');
    }

    const attacker = attackingTerritory.militaryUnit;
    const defender = defendingTerritory.militaryUnit;

    const attackDamage = this.calculateAttackDamage(attacker, defender, defendingTerritory.terrain);
    const defenseDamage = this.calculateDefenseDamage(defender, attacker);

    const attackerSurvived = attacker.health > defenseDamage;
    const defenderSurvived = defender.health > attackDamage;

    if (attackerSurvived) {
      attacker.health -= defenseDamage;
      attacker.experience += 1;
    }

    if (defenderSurvived) {
      defender.health -= attackDamage;
      defender.experience += 1;
    }

    return {
      attackerSurvived,
      defenderSurvived,
      attackerDamage: attackDamage,
      defenderDamage: defenseDamage
    };
  }

  canAttack(attackingTerritory: Territory, defendingTerritory: Territory): boolean {
    if (!attackingTerritory.militaryUnit || !defendingTerritory.militaryUnit) {
      return false;
    }

    if (attackingTerritory.militaryUnit.hasMoved) {
      return false;
    }

    if (attackingTerritory.owner === defendingTerritory.owner) {
      return false;
    }

    const distance = this.calculateDistance(
      attackingTerritory.coordinates,
      defendingTerritory.coordinates
    );

    return distance === 1;
  }

  private calculateDistance(coord1: { q: number; r: number }, coord2: { q: number; r: number }): number {
    return Math.max(
      Math.abs(coord1.q - coord2.q),
      Math.abs(coord1.r - coord2.r),
      Math.abs(-coord1.q - coord1.r - (-coord2.q - coord2.r))
    );
  }
}
