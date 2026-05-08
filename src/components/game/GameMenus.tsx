
import React from "react";
import { Territory, Resources } from "@/types/game";
import BuildingMenu from "./BuildingMenu";
import RecruitmentMenu from "./RecruitmentMenu";

interface GameMenusProps {
  showMenus: boolean;
  selectedTerritory: Territory | null;
  onBuild: (buildingType: string) => void;
  onRecruit: (unitType: string) => void;
  resources: Resources;
  currentPlayerId?: string;
}

const GameMenus: React.FC<GameMenusProps> = ({
  showMenus,
  selectedTerritory,
  onBuild,
  onRecruit,
  resources,
  currentPlayerId,
}) => {
  if (!showMenus) return null;

  return (
    <div className="flex flex-col gap-4">
      <BuildingMenu
        onBuild={onBuild}
        selectedTerritory={selectedTerritory}
        resources={resources}
        currentPlayerId={currentPlayerId}
      />
      <RecruitmentMenu
        onRecruit={onRecruit}
        resources={resources}
        selectedTerritory={selectedTerritory}
      />
    </div>
  );
};

export default GameMenus;
