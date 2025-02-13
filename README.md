
# Empire's Legacy

## Overview

Empire's Legacy is a turn-based strategy game where players compete to build and expand their empires through resource management, territory control, and military conquest. The game combines elements of classic 4X games (eXplore, eXpand, eXploit, and eXterminate) with modern web technologies.

## Features

- **Multi-player Support**: Play with 2-6 players locally or online
- **Resource Management**: Manage gold, wood, stone, and food resources
- **Territory Control**: Claim and defend territories with different resource yields
- **Building System**: Construct various buildings to boost production and military capabilities
- **Combat System**: Strategic combat with different unit types and terrain bonuses
- **Real-time Updates**: Watch game progress through the updates panel

## Game Rules

### Setup Phase

1. Players take turns claiming their starting territories
2. Each player receives initial resources:
   - 100 Gold
   - 50 Wood
   - 50 Stone
   - 50 Food

### Turn Structure

Each turn consists of five phases:

1. **Resource Phase**
   - Collect resources from controlled territories
   - Base income per territory:
     - 10 Gold
     - 5 Wood
     - 5 Stone
     - 5 Food
   - Buildings provide additional resources:
     - Lumber Mill: +20 Wood
     - Mine: +20 Stone
     - Market: +20 Gold (plus trade bonuses)
     - Farm: +8 Food

2. **Building Phase**
   - Construct buildings in controlled territories
   - Available buildings:
     - Lumber Mill (Wood production)
     - Mine (Stone production)
     - Market (Gold and trade)
     - Farm (Food production)
     - Barracks (Military units)
     - Fortress (Defense)

3. **Recruitment Phase**
   - Train military units if you have the required buildings
   - Unit types:
     - Infantry (100 Gold, 1 Food upkeep)
     - Cavalry (200 Gold, 2 Food upkeep)
     - Artillery (300 Gold, 2 Food upkeep)

4. **Movement Phase**
   - Move units between adjacent territories
   - Different terrain types affect movement costs

5. **Combat Phase**
   - Initiate battles between opposing forces
   - Combat considers:
     - Unit types and numbers
     - Terrain bonuses
     - Building effects (e.g., Fortress defense bonus)

### Victory Conditions

Win the game by achieving one of the following:
1. **Domination**: Control 75% of the map
2. **Economic**: Accumulate 10,000 gold and control 3 trade centers
3. **Military**: Capture all enemy capitals

## Technologies Used

- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Supabase (for online multiplayer)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/6ogo/empires-legacy.git

# Navigate to project directory
cd empires-legacy

# Install dependencies
npm install

# Start development server
npm run dev
```

### Playing Online

1. Choose "Online Mode" when starting a game
2. Create a new game or join an existing one with a Room ID
3. Share the Room ID with other players to join
4. Start the game when all players are ready

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Areas for Improvement

1. **Enhanced AI for Single Player**
   - Implement computer-controlled opponents
   - Add difficulty levels

2. **Additional Game Features**
   - More unit types and buildings
   - Technology tree
   - Diplomacy system
   - Trade routes

3. **UI/UX Improvements**
   - Better mobile responsiveness
   - Animated battles
   - Tutorial system
   - Improved resource visualization

4. **Technical Enhancements**
   - Game state persistence
   - Replay system
   - Spectator mode
   - Performance optimizations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI Components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## Support

For support, please open an issue in the GitHub repository or join our [Discord community](https://discord.gg/your-discord-link).
