
import React from "react";
import HexGrid from "./HexGrid";
import ResourceDisplay from "./ResourceDisplay";
import GameControls from "./GameControls";
import BuildingMenu from "./BuildingMenu";
import RecruitmentMenu from "./RecruitmentMenu";
import MobileMenu from "./MobileMenu";
import { GameState, Territory, Player } from "@/types/game";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameBoardProps {
  gameState: GameState;
  selectedTerritory: Territory | null;
  onTerritoryClick: (territory: Territory) => void;
  onEndTurn: () => void;
  onEndPhase: () => void;
  onBuild: (buildingType: string) => void;
  onRecruit: (unitType: string) => void;
  onGiveUp: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  selectedTerritory,
  onTerritoryClick,
  onEndTurn,
  onEndPhase,
  onBuild,
  onRecruit,
  onGiveUp,
}) => {
  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentPlayer
  );
  const isMobile = useIsMobile();

  if (!currentPlayer) return null;

  const renderPlayerResources = (player: Player) => (
    <div key={player.id} className="mb-4">
      <div className="text-sm text-gray-400 mb-2">
        {player.id}'s Resources {player.id === gameState.currentPlayer && "(Current Turn)"}:
      </div>
      <ResourceDisplay resources={player.resources} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <MobileMenu onGiveUp={onGiveUp} />
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-game-gold">Empire's Legacy</h1>
          <p className="text-gray-400">
            Turn {gameState.turn} - {currentPlayer.id}'s turn - {gameState.phase} phase
          </p>
        </div>

        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-4 gap-8'}`}>
          <div className={isMobile ? 'order-2' : 'lg:col-span-3'}>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-xl">
              <HexGrid
                territories={gameState.territories}
                onTerritoryClick={onTerritoryClick}
                selectedTerritory={selectedTerritory}
                currentPlayer={gameState.currentPlayer}
                playerResources={currentPlayer.resources}
                phase={gameState.phase}
              />
            </div>
          </div>

          <div className="space-y-4">
            {gameState.players.map(player => renderPlayerResources(player))}
            
            {gameState.phase === "building" && (
              <BuildingMenu 
                onBuild={onBuild}
                resources={currentPlayer.resources}
                selectedTerritory={selectedTerritory}
              />
            )}
            {gameState.phase === "recruitment" && (
              <RecruitmentMenu
                onRecruit={onRecruit}
                resources={currentPlayer.resources}
                selectedTerritory={selectedTerritory}
              />
            )}
            {!isMobile && (
              <GameControls
                gameState={gameState}
                onEndTurn={onEndTurn}
                onEndPhase={onEndPhase}
                onGiveUp={onGiveUp}
              />
            )}
          </div>
        </div>

        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm">
            <GameControls
              gameState={gameState}
              onEndTurn={onEndTurn}
              onEndPhase={onEndPhase}
              onGiveUp={onGiveUp}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
