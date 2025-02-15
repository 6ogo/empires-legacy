
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
}

const GameMenus: React.FC<GameMenusProps> = ({
  showMenus,
  selectedTerritory,
  onBuild,
  onRecruit,
  resources,
}) => {
  if (!showMenus || !selectedTerritory) return null;

  return (
    <div className="absolute top-24 inset-x-4 md:inset-x-auto md:left-4 md:right-4 flex flex-col md:flex-row justify-center gap-4">
      <BuildingMenu 
        onBuild={onBuild}
        selectedTerritory={selectedTerritory}
        resources={resources}
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
