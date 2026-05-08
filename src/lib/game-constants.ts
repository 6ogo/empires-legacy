import { Resources } from '@/types/game';

export const BUILDING_COSTS: Record<string, Partial<Resources>> = {
  lumber_mill:  { gold: 50, wood: 20 },
  mine:         { gold: 50, stone: 20 },
  market:       { gold: 100, wood: 30 },
  farm:         { gold: 50, wood: 20 },
  barracks:     { gold: 150, wood: 50, stone: 50 },
  fortress:     { gold: 300, stone: 150 },
  expand:       { wood: 25, stone: 25 },
  walls:        { gold: 100, stone: 50 },
  watchtower:   { gold: 75, stone: 25 },
  road:         { wood: 15, stone: 10 },
};

export const BUILDING_INCOME: Record<string, Partial<Resources>> = {
  lumber_mill: { wood: 5 },
  mine:        { stone: 5 },
  market:      { gold: 5 },
  farm:        { food: 5 },
};
