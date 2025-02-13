
import React from "react";
import HexGrid from "./HexGrid";
import ResourceDisplay from "./ResourceDisplay";
import GameControls from "./GameControls";
import BuildingMenu from "./BuildingMenu";
import { GameState, Territory } from "@/types/game";

interface GameBoardProps {
  gameState: GameState;
  selectedTerritory: Territory | null;
  onTerritoryClick: (territory: Territory) => void;
  onEndTurn: () => void;
  onEndPhase: () => void;
  onBuild: (buildingType: string) => void;
  onGiveUp: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  selectedTerritory,
  onTerritoryClick,
  onEndTurn,
  onEndPhase,
  onBuild,
  onGiveUp,
}) => {
  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );

  if (!currentPlayer) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-game-gold">Empire's Legacy</h1>
          <p className="text-gray-400">
            Turn {gameState.turn} - {currentPlayer.id}'s turn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-xl">
              <HexGrid
                territories={gameState.territories}
                onTerritoryClick={onTerritoryClick}
                selectedTerritory={selectedTerritory}
              />
            </div>
          </div>

          <div className="space-y-4">
            <ResourceDisplay resources={currentPlayer.resources} />
            {gameState.phase === "building" && (
              <BuildingMenu 
                onBuild={onBuild}
                resources={currentPlayer.resources}
              />
            )}
            <GameControls
              gameState={gameState}
              onEndTurn={onEndTurn}
              onEndPhase={onEndPhase}
              onGiveUp={onGiveUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
