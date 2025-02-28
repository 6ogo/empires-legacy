
import React from "react";
import { Coins, Axe, Pickaxe, Apple } from "lucide-react";

export const ResourceDisplay: React.FC<{
  resources: {
    gold: number;
    wood: number;
    stone: number;
    food: number;
  };
  resourceGain?: {
    gold: number;
    wood: number;
    stone: number;
    food: number;
  } | null;
}> = ({ resources, resourceGain }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-4">
      <h3 className="text-white text-sm font-bold mb-2">Resources</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-gray-300 text-sm">Gold</span>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-400 font-bold">{resources.gold}</span>
            {resourceGain && resourceGain.gold > 0 && (
              <span className="text-green-400 text-xs ml-1 font-bold animate-pulse">
                +{resourceGain.gold}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Axe className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-gray-300 text-sm">Wood</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 font-bold">{resources.wood}</span>
            {resourceGain && resourceGain.wood > 0 && (
              <span className="text-green-400 text-xs ml-1 font-bold animate-pulse">
                +{resourceGain.wood}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Pickaxe className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-300 text-sm">Stone</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 font-bold">{resources.stone}</span>
            {resourceGain && resourceGain.stone > 0 && (
              <span className="text-green-400 text-xs ml-1 font-bold animate-pulse">
                +{resourceGain.stone}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Apple className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-gray-300 text-sm">Food</span>
          </div>
          <div className="flex items-center">
            <span className="text-red-500 font-bold">{resources.food}</span>
            {resourceGain && resourceGain.food > 0 && (
              <span className="text-green-400 text-xs ml-1 font-bold animate-pulse">
                +{resourceGain.food}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
