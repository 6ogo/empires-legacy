
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
  const [attackMode, setAttackMode] = useState(false);

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

  const handleAttackClick = () => {
    setAttackMode(!attackMode);
    console.log("Attack clicked");
  };

  const mockPlayer = {
    resources: {
      gold: 1000,
      wood: 500,
      stone: 300,
      food: 800
    }
  };

  // Mock data for testing
  const mockTerritories = [];
  const mockPlayers = [
    { id: 0, name: "Player 1", color: "#FF5733" },
    { id: 1, name: "Player 2", color: "#33A1FF" }
  ];
  const mockExpandableTerritories = [];
  const mockAttackableTerritories = [];
  const mockBuildableTerritories = [];
  const mockRecruitableTerritories = [];
  const mockErrorMessages = {
    attack: "No valid targets",
    recruit: "Need barracks",
    build: "No territory selected",
    expand: "Need resources"
  };
  const mockActionsPerformed = {
    build: false,
    recruit: false,
    expand: false,
    attack: false
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
        players={mockPlayers}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <GameBoard 
            territories={mockTerritories}
            players={mockPlayers}
            selectedTerritory={selectedTerritory}
            onTerritorySelect={handleTerritorySelect}
            onClaimTerritory={(id: number) => console.log(`Claim territory ${id}`)}
            onAttackTerritory={(id: number) => console.log(`Attack territory ${id}`)}
            currentPlayer={0}
            phase="playing"
            actionTaken={false}
            expandableTerritories={mockExpandableTerritories}
            attackableTerritories={mockAttackableTerritories}
            buildableTerritories={mockBuildableTerritories}
            recruitableTerritories={mockRecruitableTerritories}
            currentAction="none"
            actionsPerformed={mockActionsPerformed}
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
            onAttackClick={handleAttackClick}
            disabled={false}
            actionTaken={false}
            expandMode={expandMode}
            attackMode={attackMode}
            canAttack={true}
            hasResourcesForExpansion={true}
            canRecruit={true}
            canBuild={true}
            actionsPerformed={mockActionsPerformed}
            errorMessages={mockErrorMessages}
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
