import React from 'react';
import { GameMode } from '@/types/game';

export interface GameContainerProps {
  gameMode: GameMode;
  onBack: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameMode, onBack }) => {
  return (
    <div>
      <h2>Game Container</h2>
      <p>Game Mode: {gameMode}</p>
      <button onClick={onBack}>Back to Main Menu</button>
    </div>
  );
};

export default GameContainer;
