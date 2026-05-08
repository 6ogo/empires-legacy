import { GameState, GameAction, GamePhase, Territory, GamePlayer, Resources } from '@/types/game';
import { GameStateValidator } from './game-validation';
import { BUILDING_COSTS, BUILDING_INCOME } from './game-constants';

export { BUILDING_COSTS } from './game-constants';

function deductResources(player: GamePlayer, cost: Partial<Resources>): boolean {
  for (const [resource, amount] of Object.entries(cost) as Array<[keyof Resources, number]>) {
    if ((player.resources[resource] ?? 0) < (amount ?? 0)) return false;
  }
  for (const [resource, amount] of Object.entries(cost) as Array<[keyof Resources, number]>) {
    player.resources[resource] -= amount ?? 0;
  }
  return true;
}

export function checkVictoryCondition(state: GameState): { winner: string | null; type: 'domination' | 'economic' | 'military' | null } {
  const totalTerritories = state.territories.length;
  const activePlayers = state.players.filter(p =>
    state.territories.some(t => t.owner === p.id)
  );

  if (activePlayers.length === 1 && state.turn > 1) {
    return { winner: activePlayers[0].id, type: 'military' };
  }

  for (const player of state.players) {
    const ownedCount = state.territories.filter(t => t.owner === player.id).length;
    if (totalTerritories > 0 && ownedCount / totalTerritories >= 0.75) {
      return { winner: player.id, type: 'domination' };
    }
    if (player.resources.gold >= 10000) {
      return { winner: player.id, type: 'economic' };
    }
  }
  return { winner: null, type: null };
}

export class GameStateManager {
  private state: GameState;
  private validator: GameStateValidator;

  constructor(initialState: GameState) {
    this.state = initialState;
    this.validator = new GameStateValidator(initialState);
  }

  getState(): GameState {
    return this.state;
  }

  setState(newState: GameState): void {
    this.state = newState;
    this.validator = new GameStateValidator(newState);
  }

  validateGameAction(action: GameAction) {
    return this.validator.validateAction(action);
  }

  getCombatResult(fromTerritory: Territory, toTerritory: Territory) {
    const attackerUnit = fromTerritory.militaryUnit;
    const defenderUnit = toTerritory.militaryUnit;

    if (!attackerUnit || !defenderUnit) {
      return {
        defenderDestroyed: !defenderUnit,
        attackerDamage: 0,
        defenderDamage: 0,
        attackerDestroyed: false,
      };
    }

    const attackerDamage = Math.floor(defenderUnit.damage * (1 + defenderUnit.experience * 0.1));
    const defenderDamage = Math.floor(attackerUnit.damage * (1 + attackerUnit.experience * 0.1));

    return {
      defenderDestroyed: defenderDamage >= defenderUnit.health,
      attackerDestroyed: attackerDamage >= attackerUnit.health,
      attackerDamage,
      defenderDamage,
    };
  }

  applyAction(action: GameAction): boolean {
    const validation = this.validator.validateAction(action);
    if (!validation.valid) return false;

    switch (action.type) {
      case 'CLAIM_TERRITORY': return this.handleClaimTerritory(action);
      case 'BUILD':           return this.handleBuild(action);
      case 'RECRUIT':         return this.handleRecruit(action);
      case 'ATTACK':          return this.handleAttack(action);
      case 'END_TURN':        return this.handleEndTurn(action);
      case 'END_PHASE':       return this.handleEndPhase(action);
      default:                return false;
    }
  }

  private handleClaimTerritory(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;

    const player = this.state.players.find(p => p.id === action.playerId);
    if (!player) return false;

    territory.owner = action.playerId;
    territory.lastUpdated = action.timestamp;

    if (!player.territories.includes(territory.id)) {
      player.territories.push(territory.id);
    }

    this.addUpdate({
      type: 'territory',
      message: `${action.playerId} claimed territory`,
      timestamp: action.timestamp,
      playerId: action.playerId,
    });

    return true;
  }

  private handleBuild(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;

    const player = this.state.players.find(p => p.id === action.playerId);
    if (!player) return false;

    const cost = BUILDING_COSTS[action.payload.buildingType] ?? {};
    if (!deductResources(player, cost)) return false;

    territory.building = action.payload.buildingType;
    territory.lastUpdated = action.timestamp;

    this.addUpdate({
      type: 'building',
      message: `${action.playerId} built ${action.payload.buildingType}`,
      timestamp: action.timestamp,
      playerId: action.playerId,
    });

    return true;
  }

  private handleRecruit(action: GameAction): boolean {
    const territory = this.state.territories.find(t => t.id === action.payload.territoryId);
    if (!territory) return false;

    const player = this.state.players.find(p => p.id === action.playerId);
    if (!player) return false;

    const unit = action.payload.unit;
    if (!deductResources(player, unit.cost ?? {})) return false;

    territory.militaryUnit = { ...unit, hasMoved: false };
    territory.lastUpdated = action.timestamp;

    this.addUpdate({
      type: 'territory',
      message: `${action.playerId} recruited ${unit.type}`,
      timestamp: action.timestamp,
      playerId: action.playerId,
    });

    return true;
  }

  private handleAttack(action: GameAction): boolean {
    const attackingTerritory = this.state.territories.find(t => t.id === action.payload.fromTerritoryId);
    const defendingTerritory = this.state.territories.find(t => t.id === action.payload.toTerritoryId);

    if (!attackingTerritory || !defendingTerritory) return false;

    const result = this.resolveCombat(attackingTerritory, defendingTerritory);

    if (result) {
      // Mark attacker as having moved
      if (attackingTerritory.militaryUnit) {
        attackingTerritory.militaryUnit.hasMoved = true;
      }

      // Update player territory arrays if ownership changed
      const prevOwner = defendingTerritory.owner;
      if (prevOwner !== attackingTerritory.owner && defendingTerritory.owner === attackingTerritory.owner) {
        const oldOwnerPlayer = this.state.players.find(p => p.id === prevOwner);
        const newOwnerPlayer = this.state.players.find(p => p.id === action.playerId);
        if (oldOwnerPlayer) {
          oldOwnerPlayer.territories = oldOwnerPlayer.territories.filter(id => id !== defendingTerritory.id);
        }
        if (newOwnerPlayer && !newOwnerPlayer.territories.includes(defendingTerritory.id)) {
          newOwnerPlayer.territories.push(defendingTerritory.id);
        }
      }
    }

    this.addUpdate({
      type: 'combat',
      message: `Combat: ${action.playerId} attacked territory`,
      timestamp: action.timestamp,
      playerId: action.playerId,
    });

    return true;
  }

  private handleEndTurn(action: GameAction): boolean {
    // Add building income for the player ending their turn
    const turningPlayer = this.state.players.find(p => p.id === action.playerId);
    if (turningPlayer) {
      const playerTerritories = this.state.territories.filter(t => t.owner === turningPlayer.id);
      for (const territory of playerTerritories) {
        if (territory.building) {
          const income = BUILDING_INCOME[territory.building];
          if (income) {
            for (const [resource, amount] of Object.entries(income) as Array<[keyof Resources, number]>) {
              turningPlayer.resources[resource] = (turningPlayer.resources[resource] ?? 0) + amount;
            }
          }
        }
      }
    }

    const currentPlayerIndex = this.state.players.findIndex(p => p.id === this.state.currentPlayer);
    const nextPlayerIndex = (currentPlayerIndex + 1) % this.state.players.length;

    this.state.currentPlayer = this.state.players[nextPlayerIndex].id;
    this.state.turn += 1;

    // Reset hasMoved for all units
    for (const territory of this.state.territories) {
      if (territory.militaryUnit) {
        territory.militaryUnit.hasMoved = false;
      }
    }

    this.addUpdate({
      type: 'system',
      message: `Turn ended. ${this.state.currentPlayer}'s turn begins`,
      timestamp: action.timestamp,
      playerId: action.playerId,
    });

    return true;
  }

  private handleEndPhase(action: GameAction): boolean {
    const phases: GamePhase[] = ['setup', 'building', 'recruitment', 'combat', 'end'];
    const currentPhaseIndex = phases.indexOf(this.state.phase);

    if (currentPhaseIndex < phases.length - 1) {
      this.state.phase = phases[currentPhaseIndex + 1];
    }

    this.addUpdate({
      type: 'system',
      message: `Phase changed to ${this.state.phase}`,
      timestamp: action.timestamp,
      playerId: action.playerId,
    });

    return true;
  }

  private resolveCombat(attackingTerritory: Territory, defendingTerritory: Territory): boolean {
    if (!attackingTerritory.militaryUnit) return false;

    const attackDamage = attackingTerritory.militaryUnit.damage;

    // No defender unit — capture territory directly
    if (!defendingTerritory.militaryUnit) {
      defendingTerritory.owner = attackingTerritory.owner;
      defendingTerritory.building = null;
      return true;
    }

    const counterDamage = defendingTerritory.militaryUnit.damage;

    // Apply damage
    defendingTerritory.militaryUnit.health -= attackDamage;
    attackingTerritory.militaryUnit.health -= counterDamage;

    // Resolve outcomes
    if (defendingTerritory.militaryUnit.health <= 0) {
      defendingTerritory.owner = attackingTerritory.owner;
      defendingTerritory.militaryUnit = null;
      defendingTerritory.building = null;
    }

    if (attackingTerritory.militaryUnit && attackingTerritory.militaryUnit.health <= 0) {
      attackingTerritory.militaryUnit = null;
    }

    return true;
  }

  private addUpdate(update: { type: 'territory' | 'resources' | 'combat' | 'building' | 'system'; message: string; timestamp: number; playerId?: string }) {
    this.state.updates.push(update);
    this.state.lastUpdated = update.timestamp;
    this.state.version += 1;
  }
}

export function createInitialGameState(numPlayers: number, boardSize: number): GameState {
  const territories: Territory[] = [];
  const radius = Math.floor(boardSize / 2);

  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) <= radius) {
        const terrainRoll = Math.random();
        const terrain = terrainRoll < 0.5 ? 'plains' : terrainRoll < 0.7 ? 'forest' : terrainRoll < 0.85 ? 'hills' : 'mountains';
        territories.push({
          id: `${q},${r},${s}`,
          coordinates: { q, r },
          owner: null,
          terrain,
          resources: {
            gold: Math.floor(Math.random() * 10) + 5,
            wood: Math.floor(Math.random() * 10) + 5,
            stone: Math.floor(Math.random() * 10) + 5,
            food: Math.floor(Math.random() * 10) + 5,
          },
          building: null,
          militaryUnit: null,
          lastUpdated: Date.now(),
        });
      }
    }
  }

  const players: GamePlayer[] = Array.from({ length: numPlayers }, (_, i) => ({
    id: `player${i + 1}`,
    resources: { gold: 200, wood: 150, stone: 150, food: 150 },
    territories: [],
    ready: false,
  }));

  return {
    id: `game_${Date.now()}`,
    phase: 'setup',
    turn: 1,
    currentPlayer: players[0].id,
    players,
    territories,
    updates: [],
    weather: 'clear',
    timeOfDay: 'day',
    lastUpdated: Date.now(),
    version: 1,
  };
}
