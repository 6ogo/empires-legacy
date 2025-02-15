import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameScreen from '@/components/game/GameScreen';
import CombatHistory from '@/components/game/CombatHistory';
import { useGameState } from '@/hooks/useGameState';
import { createInitialGameState } from '@/lib/game-utils';
import { useAuth } from '@/hooks/useAuth';

const GamePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameState, dispatchAction } = useGameState(createInitialGameState(2, 24));
  const [showCombatHistory, setShowCombatHistory] = useState(false);
  
  const handleBack = () => {
    navigate('/');
  };

  const handleShowCombatHistory = () => {
    setShowCombatHistory(true);
  };

  const handleCloseCombatHistory = () => {
    setShowCombatHistory(false);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <GameScreen
        gameState={gameState}
        dispatchAction={dispatchAction}
        onShowCombatHistory={handleShowCombatHistory}
        onBack={handleBack}
      />
      {showCombatHistory && (
        <CombatHistory
          gameState={gameState}
          onClose={handleCloseCombatHistory}
        />
      )}
    </>
  );
};

export default GamePage;
