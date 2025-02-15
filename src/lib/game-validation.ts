import { GameState, GamePhase, Territory, Player, Resources, GameAction } from '@/types/game';

export class GameStateValidator {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  validateState(): boolean {
    return (
      this.validatePhase() &&
      this.validatePlayers() &&
      this.validateTerritories() &&
      this.validateResources() &&
      this.validateTurnOrder()
    );
  }

  private validatePhase(): boolean {
    const validPhases: GamePhase[] = ['setup', 'building', 'recruitment', 'combat', 'end'];
    return validPhases.includes(this.state.phase);
  }

  private validatePlayers(): boolean {
    // Check if we have valid players
    if (!this.state.players.length) return false;

    // Verify each player has valid resources
    return this.state.players.every(player => this.validatePlayerResources(player));
  }

  private validatePlayerResources(player: Player): boolean {
    return (
      typeof player.resources.gold === 'number' &&
      typeof player.resources.wood === 'number' &&
      typeof player.resources.stone === 'number' &&
      typeof player.resources.food === 'number' &&
      player.resources.gold >= 0 &&
      player.resources.wood >= 0 &&
      player.resources.stone >= 0 &&
      player.resources.food >= 0
    );
  }

  private validateTerritories(): boolean {
    // Check if we have territories
    if (!this.state.territories.length) return false;

    // Verify each territory has valid coordinates and resources
    return this.state.territories.every(territory => this.validateTerritory(territory));
  }

  private validateTerritory(territory: Territory): boolean {
    return (
      typeof territory.coordinates.q === 'number' &&
      typeof territory.coordinates.r === 'number' &&
      this.validateTerritoryResources(territory.resources)
    );
  }

  private validateTerritoryResources(resources: Resources): boolean {
    return (
      typeof resources.gold === 'number' &&
      typeof resources.wood === 'number' &&
      typeof resources.stone === 'number' &&
      typeof resources.food === 'number'
    );
  }

  private validateTurnOrder(): boolean {
    return this.state.players.some(player => player.id === this.state.currentPlayer);
  }

  validateAction(action: GameAction): boolean {
    switch (action.type) {
      case 'CLAIM_TERRITORY':
        return this.validateClaimTerritory(action);
      case 'BUILD':
        return this.validateBuild(action);
      case 'RECRUIT':
        return this.validateRecruit(action);
      case 'ATTACK':
        return this.validateAttack(action);
      case 'END_TURN':
        return this.validateEndTurn(action);
      case 'END_PHASE':
        return this.validateEndPhase(action);
      default:
        return false;
    }
  }

  private validateClaimTerritory(action: GameAction): boolean {
    if (this.state.phase !== 'setup') return false;
    
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;
    
    // Check if territory is unclaimed
    if (territory.owner !== null) return false;
    
    // Check if player already has a territory in setup phase
    const playerTerritories = this.state.territories.filter(t => t.owner === action.playerId);
    if (this.state.phase === 'setup' && playerTerritories.length >= 1) return false;
    
    return true;
  }

  private validateBuild(action: GameAction): boolean {
    if (this.state.phase !== 'building') return false;
    
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;
    
    // Check territory ownership
    if (territory.owner !== action.playerId) return false;
    
    // Check if territory already has maximum buildings
    if (territory.building) return false;
    
    return true;
  }

  private validateRecruit(action: GameAction): boolean {
    if (this.state.phase !== 'recruitment') return false;
    
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;
    
    // Check territory ownership
    if (territory.owner !== action.playerId) return false;
    
    // Check if territory already has units
    if (territory.militaryUnit) return false;
    
    return true;
  }

  private validateAttack(action: GameAction): boolean {
    if (this.state.phase !== 'combat') return false;
    
    const attackingTerritory = this.state.territories.find(t => t.id === action.payload.fromTerritoryId);
    const defendingTerritory = this.state.territories.find(t => t.id === action.payload.toTerritoryId);
    
    if (!attackingTerritory || !defendingTerritory) return false;
    
    // Check territory ownership
    if (attackingTerritory.owner !== action.playerId) return false;
    if (defendingTerritory.owner === action.playerId) return false;
    
    // Check if attacking territory has units
    if (!attackingTerritory.militaryUnit) return false;
    
    return true;
  }

  private validateEndTurn(action: GameAction): boolean {
    return action.playerId === this.state.currentPlayer;
  }

  private validateEndPhase(action: GameAction): boolean {
    return action.playerId === this.state.currentPlayer;
  }
}
