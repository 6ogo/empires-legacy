
import React, { useState } from "react";
import { ResourceDisplay } from "./ResourceDisplay";
import { GameBoard } from "./GameBoard";
import { GameTopBar } from "./GameTopBar";
import { GameControls } from "./GameControls";
import { BuildingMenu } from "./BuildingMenu";
import { RecruitmentMenu } from "./RecruitmentMenu";
import { GameMenus } from "./GameMenus";

const GameScreen: React.FC = () => {
  const [selectedTerritory, setSelectedTerritory] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [expandMode, setExpandMode] = useState(false);

  const handleTerritorySelect = (id: number) => {
    setSelectedTerritory(id);
    console.log(`Selected territory: ${id}`);
  };

  const handleMenuSelect = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
    if (menu === 'expand') {
      setExpandMode(!expandMode);
    } else {
      setExpandMode(false);
    }
  };

  const mockPlayer = {
    resources: {
      gold: 1000,
      wood: 500,
      stone: 300,
      food: 800
    }
  };

  return (
    <div className="flex flex-col h-full">
      <GameTopBar 
        turn={1} 
        currentPlayer={0}
        playerColor="#FF5733"
        playerName="Player 1"
        onExitGame={() => console.log("Exit game")}
        phase="playing"
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <GameBoard 
            territories={[]}
            players={[]}
            selectedTerritory={selectedTerritory}
            onTerritorySelect={handleTerritorySelect}
            onClaimTerritory={() => {}}
            onAttackTerritory={() => {}}
            currentPlayer={0}
            phase="playing"
            actionTaken={false}
            expandableTerritories={[]}
          />
        </div>
        
        <div className="w-64 bg-gray-900 p-4 flex flex-col">
          <ResourceDisplay 
            resources={mockPlayer.resources} 
          />
          
          <GameControls 
            onBuildClick={() => handleMenuSelect("build")}
            onRecruitClick={() => handleMenuSelect("recruit")}
            onExpandClick={() => handleMenuSelect("expand")}
            onEndTurnClick={() => console.log("End turn")}
            disabled={false}
            actionTaken={false}
            expandMode={expandMode}
          />
          
          {activeMenu === "build" && (
            <BuildingMenu onSelect={(type) => console.log(`Build ${type}`)} />
          )}
          
          {activeMenu === "recruit" && (
            <RecruitmentMenu onSelect={(type) => console.log(`Recruit ${type}`)} />
          )}
          
          <GameMenus onInfoButtonClick={(type) => console.log(`Info ${type}`)} />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
