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

  private applyAttackModifiers(baseDamage: number): number {
    // Add attack modifiers (terrain, buildings, etc.)
    return baseDamage;
  }

  private applyDefenseModifiers(baseDamage: number): number {
    // Add defense modifiers (terrain, buildings, etc.)
    return baseDamage;
  }
}
