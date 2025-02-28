
import React from "react";
import { Button } from "../ui/button";

export const RecruitmentMenu: React.FC<{
  onSelect: (type: string) => void;
}> = ({ onSelect }) => {
  const units = [
    { type: "infantry", name: "Infantry", description: "Basic military unit", cost: "100 Gold, 10 Food", upkeep: "1 Food" },
    { type: "cavalry", name: "Cavalry", description: "Fast-moving unit", cost: "200 Gold, 20 Food", upkeep: "2 Food" },
    { type: "artillery", name: "Artillery", description: "Powerful ranged unit", cost: "300 Gold, 50 Stone, 20 Food", upkeep: "2 Food" }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-4 overflow-y-auto max-h-80">
      <h3 className="text-white text-sm font-bold mb-2">Recruit Unit</h3>
      
      <div className="space-y-2">
        {units.map((unit) => (
          <div 
            key={unit.type}
            className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600"
            onClick={() => onSelect(unit.type)}
          >
            <h4 className="text-white text-sm font-bold">{unit.name}</h4>
            <p className="text-gray-300 text-xs">{unit.description}</p>
            <p className="text-gray-400 text-xs">Cost: {unit.cost}</p>
            <p className="text-gray-400 text-xs">Upkeep: {unit.upkeep}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
