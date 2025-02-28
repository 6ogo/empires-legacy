import React, { useState } from "react";
import { GameState, GameAction, Territory } from "@/types/game";
import GameBoard from "./GameBoard";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import BuildingMenu from "./BuildingMenu";
import RecruitmentMenu from "./RecruitmentMenu";
import GameTopBar from "./GameTopBar";
import GameControls from "./GameControls";
import GameUpdatesPanel from "./GameUpdatesPanel";

interface GameScreenProps {
  gameState: GameState;
  dispatchAction: (action: GameAction) => boolean;
  onShowCombatHistory: () => void;
  onBack: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  dispatchAction,
  onShowCombatHistory,
  onBack,
}) => {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [showMenus, setShowMenus] = useState(false);

  const handleEndTurn = () => {
    dispatchAction({
      type: 'END_TURN',
      playerId: gameState.currentPlayer,
      timestamp: Date.now(),
      payload: {}
    });
  };

  const handleEndPhase = () => {
    dispatchAction({
      type: 'END_PHASE',
      playerId: gameState.currentPlayer,
      timestamp: Date.now(),
      payload: {}
    });
  };

  const handleGiveUp = () => {
    if (confirm("Are you sure you want to give up?")) {
      onBack();
    }
  };

  const handleTerritoryClick = (territory: Territory) => {
    // If we're in setup phase, handle territory claiming
    if (gameState.phase === 'setup') {
      if (territory.owner === null) {
        dispatchAction({
          type: 'CLAIM_TERRITORY',
          playerId: gameState.currentPlayer,
          timestamp: Date.now(),
          payload: { territoryId: territory.id }
        });
        setSelectedTerritory(null);
        setShowMenus(false);
      }
      return;
    }

    // For combat phase, handle attack logic
    if (gameState.phase === 'combat') {
      if (selectedTerritory && territory.owner !== gameState.currentPlayer) {
        dispatchAction({
          type: 'ATTACK',
          playerId: gameState.currentPlayer,
          timestamp: Date.now(),
          payload: { fromTerritoryId: selectedTerritory.id, toTerritoryId: territory.id }
        });
        setSelectedTerritory(null);
        setShowMenus(false);
        return;
      }
    }

    // Otherwise handle territory selection
    if (territory.owner === gameState.currentPlayer) {
      setSelectedTerritory(territory);
      setShowMenus(true);
    } else {
      setSelectedTerritory(null);
      setShowMenus(false);
    }
  };

  const handleBuild = (buildingType: string) => {
    if (!selectedTerritory) return;

    dispatchAction({
      type: 'BUILD',
      playerId: gameState.currentPlayer,
      timestamp: Date.now(),
      payload: { territoryId: selectedTerritory.id, buildingType }
    });
    
    setSelectedTerritory(null);
    setShowMenus(false);
  };

  const handleRecruit = (unitType: string) => {
    if (!selectedTerritory) return;
    
    // Get unit data - in a real implementation, this would come from a proper unit definition
    const unitData = {
      type: unitType,
      health: 100,
      damage: 30,
      experience: 0,
      hasMoved: false,
      cost: {
        gold: 100,
        food: 50
      }
    };

    dispatchAction({
      type: 'RECRUIT',
      playerId: gameState.currentPlayer,
      timestamp: Date.now(),
      payload: { territoryId: selectedTerritory.id, unit: unitData }
    });
    
    setSelectedTerritory(null);
    setShowMenus(false);
  };

  // Get current player's resources
  const currentPlayerResources = gameState.players.find(
    p => p.id === gameState.currentPlayer
  )?.resources || { gold: 0, wood: 0, stone: 0, food: 0 };

  return (
    <div className="min-h-screen bg-[#141B2C] relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20"
        >
          Back to Menu
        </Button>
        <Button
          variant="outline"
          onClick={onShowCombatHistory}
          className="bg-white/10 hover:bg-white/20"
        >
          <History className="w-4 h-4 mr-2" />
          Combat History
        </Button>
      </div>
      
      <GameTopBar onBack={onBack} resources={currentPlayerResources} />
      
      <div className="flex flex-col md:flex-row min-h-screen pt-16">
        <div className="flex-grow relative">
          <GameBoard
            territories={gameState.territories}
            selectedTerritory={selectedTerritory}
            onTerritoryClick={handleTerritoryClick}
            currentPlayer={gameState.currentPlayer}
            playerResources={currentPlayerResources}
            phase={gameState.phase}
          />
        </div>

        <div className="absolute bottom-4 right-4 z-20">
          <GameControls
            gameState={gameState}
            onEndTurn={handleEndTurn}
            onEndPhase={handleEndPhase}
            onGiveUp={handleGiveUp}
          />
        </div>

        {gameState.updates.length > 0 && (
          <GameUpdatesPanel updates={gameState.updates.slice(-5)} />
        )}

        {showMenus && (
          <div className="absolute top-24 right-4 flex flex-col gap-4 w-80">
            {gameState.phase === 'building' && (
              <BuildingMenu
                onBuild={handleBuild}
                resources={currentPlayerResources}
                selectedTerritory={selectedTerritory}
              />
            )}
            
            {gameState.phase === 'recruitment' && (
              <RecruitmentMenu
                onRecruit={handleRecruit}
                resources={currentPlayerResources}
                selectedTerritory={selectedTerritory}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;