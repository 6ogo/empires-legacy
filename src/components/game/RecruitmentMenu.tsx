
import React from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

export const RecruitmentMenu: React.FC<{
  onSelect: (type: string) => void;
}> = ({ onSelect }) => {
  const units = [
    { type: "infantry", name: "Infantry", description: "Basic military unit", cost: "50 Food, 30 Gold", upkeep: "1 Food" },
    { type: "cavalry", name: "Cavalry", description: "Fast-moving unit", cost: "80 Food, 70 Gold", upkeep: "2 Food" },
    { type: "artillery", name: "Artillery", description: "Powerful ranged unit", cost: "60 Food, 50 Gold, 30 Wood, 20 Stone", upkeep: "2 Food" }
  ];

  const handleSelect = (type: string) => {
    onSelect(type);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-4 overflow-y-auto max-h-80 shadow-lg">
      <h3 className="text-white text-sm font-bold mb-2">Recruit Unit</h3>
      
      <div className="space-y-2">
        {units.map((unit) => (
          <motion.div 
            key={unit.type}
            className="bg-gray-700 rounded p-2 cursor-pointer hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleSelect(unit.type)}
          >
            <h4 className="text-white text-sm font-bold">{unit.name}</h4>
            <p className="text-gray-300 text-xs">{unit.description}</p>
            <p className="text-gray-400 text-xs">Cost: {unit.cost}</p>
            <p className="text-gray-400 text-xs">Upkeep: {unit.upkeep}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
