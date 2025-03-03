
# Empire's Legacy 
https://www.empireslegacy.se/

## Overview

Empire's Legacy is a turn-based strategy game where players compete to build and expand their empires through resource management, territory control, and military conquest. The game combines elements of classic 4X games (eXplore, eXpand, eXploit, and eXterminate) with modern web technologies.

## Game Modes

### Local Multiplayer
- Play with 2-6 players on the same device
- Perfect for learning the game mechanics
- Instant turns without waiting for server responses
- Great for local tournaments or friendly matches

### Online Multiplayer
- Create or join game rooms with 2-6 players
- Real-time player synchronization
- Chat with other players during the game
- Persistent game state across sessions
- Achievement tracking and XP progression

## Core Game Mechanics

### Resources
- **Gold**: Main currency for purchasing units and buildings
- **Wood**: Required for basic buildings and military structures
- **Stone**: Used for defensive structures and advanced buildings
- **Food**: Maintains military units and population

### Territory Types
- **Plains**: Balanced resource output
- **Mountains**: Enhanced stone production and defense bonuses
- **Forests**: Increased wood production and ambush opportunities
- **Coast**: Trading advantages and naval bonuses
- **Capital**: Enhanced production and strategic importance

### Buildings
1. **Resource Buildings**
   - Lumber Mill: +20 Wood production
   - Mine: +20 Stone production
   - Market: +20 Gold + trade bonuses
   - Farm: +8 Food production

2. **Military Buildings**
   - Barracks: Enables infantry recruitment
   - Fortress: Provides defensive bonuses
   - Road: Improves unit movement

### Military Units
1. **Infantry** (100 Gold, 1 Food upkeep)
   - Basic military unit
   - Strong in defensive positions
   - Effective in forest terrain

2. **Cavalry** (200 Gold, 2 Food upkeep)
   - Fast-moving unit
   - Strong first strike capability
   - Excellent for raiding and quick attacks

3. **Artillery** (300 Gold, 2 Food upkeep)
   - Powerful ranged unit
   - Strong against buildings
   - Vulnerable in close combat

## Random Events System

Random events add unpredictability and excitement to each game:

### Resource Events
- Bountiful Harvest: +50% food production for 2 turns
- Gold Rush: +100% gold production for 1 turn
- Drought: -30% food production for 3 turns
- Trade Boom: +75% trade income for 2 turns

### Combat Events
- Fog of War: Combat visibility reduced for 1 turn
- Morale Surge: Units gain +25% combat strength for 1 turn
- Supply Line Disruption: Units cost +50% upkeep for 2 turns
- Veteran Training: New units start with +1 experience

### Territory Events
- Natural Disaster: Random territory loses 50% production for 1 turn
- Border Dispute: Random neutral territory becomes claimable
- Resource Discovery: Random territory gains +1 resource production
- Cultural Festival: +50% influence generation in a random territory

## Experience System

### XP Rewards
- **Participation**: 100 XP for completing any game
- **Victory Rewards** (based on player count):
  - 2 Players: 750 XP
  - 3 Players: 1000 XP
  - 4 Players: 1250 XP
  - 5 Players: 1500 XP
  - 6 Players: 2000 XP

### Level Progression
- Each level requires progressively more XP
- Unlock achievements for additional XP rewards
- Track your progress in the achievements page

## Victory Conditions

1. **Domination Victory**
   - Control 75% of the map
   - Eliminate all enemy forces

2. **Economic Victory**
   - Accumulate 10,000 gold
   - Control at least 3 trade centers

3. **Military Victory**
   - Capture all enemy capitals
   - Maintain control for one full turn

## Game Phases

1. **Setup Phase**
   - Players select starting territories
   - Initial resource allocation
   - First building placement

2. **Main Game Phase** (Turn Structure)
   - Resource Collection
   - Building Construction
   - Unit Recruitment
   - Movement
   - Combat Resolution

## Technologies Used

- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Supabase (for online multiplayer)
- Tanstack Query
- Lucide Icons
- Recharts

## Contributing

We welcome contributions! Please check our issues page for current tasks or suggest improvements.

## License

no license
