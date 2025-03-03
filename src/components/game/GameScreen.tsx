import React from 'react';
// Fix the import to use the default export from GameBoard
import GameBoard from './GameBoard';

interface GameScreenProps {
  settings: {
    boardSize: string;
    playerCount: number;
    gameMode: string;
    playerNames: string[];
    playerColors: string[];
  };
  onExitGame: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ settings, onExitGame }) => {
  return (
    <div className="h-full w-full bg-gray-900 text-white">
      <GameBoard 
        territories={[]}
        players={[]}
        selectedTerritory={null}
        onTerritoryClick={() => {}}
        currentPlayer={0}
        phase="setup"
      />
    </div>
  );
};

export default GameScreen;
