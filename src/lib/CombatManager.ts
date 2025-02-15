import { Territory, MilitaryUnit, GameState } from '@/types/game';

export interface CombatResult {
  success: boolean;
  message: string;
  territoryCapture: boolean;
  attackerLosses: number;
  defenderLosses: number;
  defenderRemaining: number;
}

export class CombatManager {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  resolveCombat(
    attackingTerritory: Territory,
    defendingTerritory: Territory
  ): CombatResult {
    // Validate combat is possible
    const validationResult = this.validateCombat(attackingTerritory, defendingTerritory);
    if (!validationResult.success) {
      return validationResult;
    }

    // Get units
    const attackerUnit = attackingTerritory.militaryUnit;
    const defenderUnit = defendingTerritory.militaryUnit;

    if (!attackerUnit || !defenderUnit) {
      return {
        success: false,
        message: "Missing military units",
        territoryCapture: false,
        attackerLosses: 0,
        defenderLosses: 0,
        defenderRemaining: 0
      };
    }

    // Calculate combat results
    const combatResult = this.calculateCombatResult(attackerUnit, defenderUnit);

    // Apply combat results
    return this.applyCombatResults(
      attackingTerritory,
      defendingTerritory,
      combatResult
    );
  }

  private validateCombat(
    attackingTerritory: Territory,
    defendingTerritory: Territory
  ): CombatResult {
    // Check if territories are adjacent
    if (!this.areTerritoriesAdjacent(attackingTerritory, defendingTerritory)) {
      return {
        success: false,
        message: "Territories must be adjacent",
        territoryCapture: false,
        attackerLosses: 0,
        defenderLosses: 0,
        defenderRemaining: 0
      };
    }

    // Check if attacker has units
    if (!attackingTerritory.militaryUnit) {
      return {
        success: false,
        message: "No attacking units present",
        territoryCapture: false,
        attackerLosses: 0,
        defenderLosses: 0,
        defenderRemaining: 0
      };
    }

    // Check if defender has units
    if (!defendingTerritory.militaryUnit) {
      return {
        success: false,
        message: "No defending units present",
        territoryCapture: false,
        attackerLosses: 0,
        defenderLosses: 0,
        defenderRemaining: 0
      };
    }

    return {
      success: true,
      message: "Combat validation successful",
      territoryCapture: false,
      attackerLosses: 0,
      defenderLosses: 0,
      defenderRemaining: 0
    };
  }

  private calculateCombatResult(
    attackerUnit: MilitaryUnit,
    defenderUnit: MilitaryUnit
  ): {
    attackerLosses: number;
    defenderLosses: number;
    defenderRemaining: number;
  } {
    // Calculate base damage
    const attackerDamage = attackerUnit.damage;
    const defenderDamage = defenderUnit.damage;

    // Apply terrain and building bonuses if any
    const finalAttackerDamage = this.applyAttackModifiers(attackerDamage);
    const finalDefenderDamage = this.applyDefenseModifiers(defenderDamage);

    // Calculate losses
    const defenderLosses = Math.min(finalAttackerDamage, defenderUnit.health);
    const attackerLosses = Math.min(finalDefenderDamage, attackerUnit.health);
    const defenderRemaining = Math.max(0, defenderUnit.health - defenderLosses);

    return {
      attackerLosses,
      defenderLosses,
      defenderRemaining
    };
  }

  private applyCombatResults(
    attackingTerritory: Territory,
    defendingTerritory: Territory,
    combatResult: {
      attackerLosses: number;
      defenderLosses: number;
      defenderRemaining: number;
    }
  ): CombatResult {
    if (!attackingTerritory.militaryUnit || !defendingTerritory.militaryUnit) {
      return {
        success: false,
        message: "Missing military units",
        territoryCapture: false,
        attackerLosses: 0,
        defenderLosses: 0,
        defenderRemaining: 0
      };
    }

    // Apply damage to units
    attackingTerritory.militaryUnit.health -= combatResult.attackerLosses;
    defendingTerritory.militaryUnit.health -= combatResult.defenderLosses;

    // Check for unit destruction
    if (attackingTerritory.militaryUnit.health <= 0) {
      attackingTerritory.militaryUnit = null;
    }
    
    // Check for territory capture
    const territoryCapture = defendingTerritory.militaryUnit.health <= 0;
    if (territoryCapture) {
      defendingTerritory.militaryUnit = null;
      defendingTerritory.owner = attackingTerritory.owner;
      defendingTerritory.building = null; // Destroy buildings on capture
    }

    return {
      success: true,
      message: territoryCapture ? "Territory captured!" : "Combat resolved",
      territoryCapture,
      attackerLosses: combatResult.attackerLosses,
      defenderLosses: combatResult.defenderLosses,
      defenderRemaining: combatResult.defenderRemaining
    };
  }

  private areTerritoriesAdjacent(t1: Territory, t2: Territory): boolean {
    const dx = Math.abs(t1.coordinates.q - t2.coordinates.q);
    const dy = Math.abs(t1.coordinates.r - t2.coordinates.r);
    const ds = Math.abs((t1.coordinates.q + t1.coordinates.r) - (t2.coordinates.q + t2.coordinates.r));
    return (dx <= 1 && dy <= 1 && ds <= 1) && !(dx === 0 && dy === 0);
  }

private applyAttackModifiers(
    baseDamage: number,
    attackerTerritory: Territory,
    defenderTerritory: Territory
  ): number {
    let modifiedDamage = baseDamage;
    
    // Terrain type modifiers for attacker
    switch (attackerTerritory.terrain) {
      case 'hills':
        modifiedDamage *= 1.2; // +20% damage from high ground
        break;
      case 'forest':
        modifiedDamage *= 0.9; // -10% damage from forest (harder to coordinate)
        break;
      case 'plains':
        modifiedDamage *= 1.1; // +10% damage on open ground
        break;
    }

    // Building modifiers for attacker
    if (attackerTerritory.building) {
      switch (attackerTerritory.building) {
        case 'barracks':
          modifiedDamage *= 1.15; // +15% damage from military training
          break;
        case 'watchtower':
          modifiedDamage *= 1.1; // +10% damage from better visibility
          break;
      }
    }

    // Unit status modifiers
    if (attackerTerritory.militaryUnit) {
      // Damaged units deal less damage
      const healthPercentage = attackerTerritory.militaryUnit.health / 100;
      modifiedDamage *= Math.max(0.5, healthPercentage); // Minimum 50% damage

      // Experience bonus if implemented
      if (attackerTerritory.militaryUnit.experience) {
        modifiedDamage *= (1 + (attackerTerritory.militaryUnit.experience * 0.05)); // +5% per experience level
      }
    }

    // Weather modifiers (if implemented in game state)
    if (this.state.weather) {
      switch (this.state.weather) {
        case 'rain':
          modifiedDamage *= 0.9; // -10% damage in rain
          break;
        case 'fog':
          modifiedDamage *= 0.8; // -20% damage in fog
          break;
      }
    }

    return Math.round(modifiedDamage);
  }

  private applyDefenseModifiers(
    baseDamage: number,
    defenderTerritory: Territory
  ): number {
    let modifiedDamage = baseDamage;
    
    // Terrain type modifiers for defender
    switch (defenderTerritory.terrain) {
      case 'mountains':
        modifiedDamage *= 0.7; // -30% damage taken in mountains
        break;
      case 'forest':
        modifiedDamage *= 0.8; // -20% damage taken in forest
        break;
      case 'hills':
        modifiedDamage *= 0.85; // -15% damage taken on hills
        break;
      case 'river':
        modifiedDamage *= 0.9; // -10% damage taken near river
        break;
    }

    // Building modifiers for defender
    if (defenderTerritory.building) {
      switch (defenderTerritory.building) {
        case 'fortress':
          modifiedDamage *= 0.6; // -40% damage taken in fortress
          break;
        case 'walls':
          modifiedDamage *= 0.75; // -25% damage taken behind walls
          break;
        case 'watchtower':
          modifiedDamage *= 0.9; // -10% damage taken with early warning
          break;
      }
    }

    // Unit status modifiers
    if (defenderTerritory.militaryUnit) {
      // Entrenched bonus (if unit hasn't moved this turn)
      if (!defenderTerritory.militaryUnit.hasMoved) {
        modifiedDamage *= 0.9; // -10% damage taken when entrenched
      }

      // Experience bonus if implemented
      if (defenderTerritory.militaryUnit.experience) {
        modifiedDamage *= (1 - (defenderTerritory.militaryUnit.experience * 0.03)); // -3% per experience level
      }
    }

    // Time of day modifiers (if implemented)
    if (this.state.timeOfDay === 'night') {
      modifiedDamage *= 0.9; // -10% damage taken at night (defenders advantage)
    }

    // Adjacent friendly unit support
    const adjacentSupport = this.calculateAdjacentSupport(defenderTerritory);
    modifiedDamage *= (1 - (adjacentSupport * 0.05)); // -5% per supporting unit

    return Math.round(modifiedDamage);
  }

  private calculateAdjacentSupport(territory: Territory): number {
    let supportCount = 0;
    
    // Get all adjacent territories
    const adjacentTerritories = this.state.territories.filter(t => 
      this.areTerritoriesAdjacent(t, territory) &&
      t.owner === territory.owner &&
      t.militaryUnit !== null
    );

    // Count supporting units
    supportCount = adjacentTerritories.length;

    // Cap the support bonus
    return Math.min(supportCount, 3); // Maximum 3 supporting units (-15% damage)
  }
