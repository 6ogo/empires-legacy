import { GameState, Player, Territory, Resources, GameUpdate } from '@/types/game';

export interface TurnValidationResult {
  valid: boolean;
  message?: string;
}

export class TurnManager {
  private state: GameState;
  private resourcesCollected: Set<string> = new Set();
  private actionsPerformed: Map<string, Set<string>> = new Map();

  constructor(state: GameState) {
    this.state = state;
  }

  startTurn(): void {
    // Clear tracking sets for new turn
    this.resourcesCollected.clear();
    this.actionsPerformed.clear();
    this.collectResources();
  }

  private collectResources(): void {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;

    const playerTerritories = this.state.territories.filter(t => t.owner === currentPlayer.id);
    
    playerTerritories.forEach(territory => {
      if (!this.resourcesCollected.has(territory.id)) {
        this.applyResourceCollection(territory, currentPlayer);
        this.resourcesCollected.add(territory.id);
      }
    });
  }

  private applyResourceCollection(territory: Territory, player: Player): void {
    // Base resources from territory
    const baseResources = { ...territory.resources };
    
    // Apply building bonuses
    if (territory.building) {
      const buildingBonus = this.calculateBuildingBonus(territory.building, baseResources);
      Object.keys(buildingBonus).forEach(key => {
        baseResources[key as keyof Resources] += buildingBonus[key as keyof Resources];
      });
    }

    // Update player resources
    Object.keys(baseResources).forEach(key => {
      player.resources[key as keyof Resources] += baseResources[key as keyof Resources];
    });
  }

  private calculateBuildingBonus(buildingType: string, baseResources: Resources): Resources {
    const bonus: Resources = { gold: 0, wood: 0, stone: 0, food: 0 };

    switch (buildingType) {
      case 'lumber_mill':
        bonus.wood = Math.floor(baseResources.wood * 0.5);
        break;
      case 'mine':
        bonus.stone = Math.floor(baseResources.stone * 0.5);
        break;
      case 'market':
        bonus.gold = Math.floor((baseResources.wood + baseResources.stone + baseResources.food) * 0.2);
        break;
      case 'farm':
        bonus.food = Math.floor(baseResources.food * 0.5);
        break;
    }

    return bonus;
  }

  validateEndTurn(): TurnValidationResult {
    // Ensure current player exists
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { valid: false, message: "Current player not found" };
    }

    // Validate phase-specific requirements
    const phaseValidation = this.validatePhaseRequirements();
    if (!phaseValidation.valid) {
      return phaseValidation;
    }

    // Ensure all resources have been collected
    if (!this.validateResourceCollection()) {
      return { valid: false, message: "Resource collection incomplete" };
    }

    // Ensure no pending actions
    if (!this.validatePendingActions()) {
      return { valid: false, message: "There are pending actions to complete" };
    }

    return { valid: true };
  }

  private validatePhaseRequirements(): TurnValidationResult {
    switch (this.state.phase) {
      case 'setup':
        return this.validateSetupPhase();
      case 'building':
        return this.validateBuildingPhase();
      case 'recruitment':
        return this.validateRecruitmentPhase();
      case 'combat':
        return this.validateCombatPhase();
      default:
        return { valid: true };
    }
  }

  private getCurrentPlayer(): Player | undefined {
    return this.state.players.find(p => p.id === this.state.currentPlayer);
  }

  // Phase-specific validations
  private validateSetupPhase(): TurnValidationResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return { valid: false, message: "Player not found" };

    const playerTerritories = this.state.territories.filter(t => t.owner === currentPlayer.id);
    
    if (playerTerritories.length === 0) {
      return { valid: false, message: "Must claim a territory during setup" };
    }

    if (playerTerritories.length > 1) {
      return { valid: false, message: "Cannot claim more than one territory during setup" };
    }

    return { valid: true };
  }

  private validateResourceCollection(): boolean {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return false;

    const playerTerritories = this.state.territories.filter(t => t.owner === currentPlayer.id);
    return playerTerritories.every(t => this.resourcesCollected.has(t.id));
  }

  private validatePendingActions(): boolean {
    return true; // Implement based on specific game rules
  }

  private validateBuildingPhase(): TurnValidationResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return { valid: false, message: "Player not found" };

    // Check if at least one building action was performed (optional requirement)
    const hasBuilt = this.actionsPerformed.get(currentPlayer.id)?.has('build');
    
    // Check if player has expanded territory (required once per turn)
    const hasExpanded = this.actionsPerformed.get(currentPlayer.id)?.has('expand');
    if (!hasExpanded) {
      return { valid: false, message: "Must expand territory during building phase" };
    }

    // Validate building limits per territory
    const playerTerritories = this.state.territories.filter(t => t.owner === currentPlayer.id);
    const buildingViolation = playerTerritories.find(t => {
      const buildings = t.building ? 1 : 0;
      return buildings > 2; // Maximum 2 buildings per territory
    });

    if (buildingViolation) {
      return { valid: false, message: "Territory exceeds building limit" };
    }

    return { valid: true };
  }

  private validateRecruitmentPhase(): TurnValidationResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return { valid: false, message: "Player not found" };

    // Check if at least one recruitment was made (one unit type per turn)
    const hasRecruited = this.actionsPerformed.get(currentPlayer.id)?.has('recruit');
    if (!hasRecruited) {
      return { valid: false, message: "Must recruit at least one unit during recruitment phase" };
    }

    // Validate one unit type per turn limit
    const recruitmentTypes = new Set<string>();
    const playerTerritories = this.state.territories.filter(t => t.owner === currentPlayer.id);
    
    playerTerritories.forEach(territory => {
      if (territory.militaryUnit) {
        recruitmentTypes.add(territory.militaryUnit.type);
      }
    });

    if (recruitmentTypes.size > 1) {
      return { valid: false, message: "Can only recruit one unit type per turn" };
    }

    return { valid: true };
  }

  private validateCombatPhase(): TurnValidationResult {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return { valid: false, message: "Player not found" };

    // Get all player territories that have units
    const playerTerritoriesWithUnits = this.state.territories.filter(t => 
      t.owner === currentPlayer.id && t.militaryUnit
    );

    // Get all adjacent enemy territories
    const enemyTerritories = this.state.territories.filter(t => 
      t.owner !== currentPlayer.id && t.owner !== null
    );

    // Check if there are possible combat opportunities
    let hasCombatOpportunity = false;
    playerTerritoriesWithUnits.forEach(playerTerritory => {
      enemyTerritories.forEach(enemyTerritory => {
        if (this.areTerritoriesAdjacent(playerTerritory, enemyTerritory)) {
          hasCombatOpportunity = true;
        }
      });
    });

    // If there are combat opportunities but no attacks were made, that's valid
    // Combat is optional but should be available
    const hasAttacked = this.actionsPerformed.get(currentPlayer.id)?.has('attack');
    
    // Track if any units are restored (50% of original cost)
    const hasRestoredUnits = this.actionsPerformed.get(currentPlayer.id)?.has('restore');

    // Check if any damaged units haven't been restored
    const hasDamagedUnits = playerTerritoriesWithUnits.some(territory => 
      territory.militaryUnit && territory.militaryUnit.health < 100
    );

    if (hasDamagedUnits && !hasRestoredUnits) {
      return { 
        valid: false, 
        message: "Must restore or replace damaged units before ending combat phase" 
      };
    }

    return { valid: true };
  }

  private areTerritoriesAdjacent(t1: Territory, t2: Territory): boolean {
    const dx = Math.abs(t1.coordinates.q - t2.coordinates.q);
    const dy = Math.abs(t1.coordinates.r - t2.coordinates.r);
    const ds = Math.abs((t1.coordinates.q + t1.coordinates.r) - (t2.coordinates.q + t2.coordinates.r));
    return (dx <= 1 && dy <= 1 && ds <= 1) && !(dx === 0 && dy === 0);
  }
