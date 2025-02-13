
import React from "react";
import { GameState, Territory } from "@/types/game";
import GameBoard from "./GameBoard";
import GameUpdatesPanel from "./GameUpdatesPanel";

interface GameScreenProps {
  gameState: GameState;
  selectedTerritory: Territory | null;
  onTerritoryClick: (territory: Territory) => void;
  onEndTurn: () => void;
  onEndPhase: () => void;
  onBuild: (buildingType: string) => void;
  onRecruit: (unitType: string) => void;
  onGiveUp: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  selectedTerritory,
  onTerritoryClick,
  onEndTurn,
  onEndPhase,
  onBuild,
  onRecruit,
  onGiveUp,
}) => {
  return (
    <>
      <GameBoard
        gameState={gameState}
        selectedTerritory={selectedTerritory}
        onTerritoryClick={onTerritoryClick}
        onEndTurn={onEndTurn}
        onEndPhase={onEndPhase}
        onBuild={onBuild}
        onRecruit={onRecruit}
        onGiveUp={onGiveUp}
      />
      <GameUpdatesPanel gameState={gameState} />
    </>
  );
};

export default GameScreen;
