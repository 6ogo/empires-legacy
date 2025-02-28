
import React from "react";
import { Button } from "../ui/button";

export const BuildingMenu: React.FC<{
  onSelect: (type: string) => void;
}> = ({ onSelect }) => {
  const buildings = [
    { type: "lumberMill", name: "Lumber Mill", description: "+20 Wood production", cost: "50 Wood, 20 Stone" },
    { type: "mine", name: "Mine", description: "+20 Stone production", cost: "30 Wood, 50 Stone" },
    { type: "market", name: "Market", description: "+20 Gold + trade bonuses", cost: "40 Wood, 40 Stone, 100 Gold" },
    { type: "farm", name: "Farm", description: "+8 Food production", cost: "50 Wood, 50 Gold" },
    { type: "barracks", name: "Barracks", description: "Enables unit recruitment", cost: "80 Wood, 60 Stone, 150 Gold" },
    { type: "fortress", name: "Fortress", description: "Provides defensive bonuses", cost: "50 Wood, 150 Stone, 200 Gold" }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-4 overflow-y-auto max-h-80">
      <h3 className="text-white text-sm font-bold mb-2">Build Structure</h3>
      
      <div className="space-y-2">
        {buildings.map((building) => (
          <div 
            key={building.type}
            className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600"
            onClick={() => onSelect(building.type)}
          >
            <h4 className="text-white text-sm font-bold">{building.name}</h4>
            <p className="text-gray-300 text-xs">{building.description}</p>
            <p className="text-gray-400 text-xs">Cost: {building.cost}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
