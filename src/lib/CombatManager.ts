
import { GameState, MilitaryUnit } from '@/types/game';

export class CombatManager {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  calculateAttackDamage(attacker: MilitaryUnit, defender: MilitaryUnit, terrain: string): number {
    // Base damage calculation
    let damage = attacker.damage;

    // Apply terrain modifiers
    switch (terrain) {
      case 'mountain':
        damage *= 0.8; // 20% reduction in mountains
        break;
      case 'forest':
        damage *= 0.9; // 10% reduction in forests
        break;
      default:
        break;
    }

    return Math.floor(damage);
  }

  calculateDefenseDamage(defender: MilitaryUnit, attacker: MilitaryUnit): number {
    // Counter-attack damage is 50% of normal attack
    return Math.floor(defender.damage * 0.5);
  }

  resolveCombat(attackerId: string, defenderId: string): {
    attackerDamage: number;
    defenderDamage: number;
    attackerDestroyed: boolean;
    defenderDestroyed: boolean;
  } {
    const attackerTerritory = this.state.territories.find(t => t.id === attackerId);
    const defenderTerritory = this.state.territories.find(t => t.id === defenderId);

    if (!attackerTerritory?.militaryUnit || !defenderTerritory?.militaryUnit) {
      throw new Error('Invalid combat: missing units');
    }

    const attackDamage = this.calculateAttackDamage(
      attackerTerritory.militaryUnit,
      defenderTerritory.militaryUnit,
      defenderTerritory.terrain
    );

    const defenseDamage = this.calculateDefenseDamage(
      defenderTerritory.militaryUnit,
      attackerTerritory.militaryUnit
    );

    return {
      attackerDamage: defenseDamage,
      defenderDamage: attackDamage,
      attackerDestroyed: defenseDamage >= attackerTerritory.militaryUnit.health,
      defenderDestroyed: attackDamage >= defenderTerritory.militaryUnit.health
    };
  }
}
