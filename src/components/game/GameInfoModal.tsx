
import React from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

export const GameInfoModal: React.FC<{
  type: string;
  onClose: () => void;
}> = ({ type, onClose }) => {
  const renderContent = () => {
    switch (type) {
      case "rules":
        return (
          <>
            <h3 className="text-xl font-bold text-white mb-4">Game Rules</h3>
            <div className="space-y-4 text-sm text-gray-300">
              <p>
                <strong className="text-white">Objective:</strong> Expand your empire and defeat your opponents by controlling territories, managing resources, and building a powerful army.
              </p>
              
              <h4 className="text-white font-bold">Game Flow:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Setup phase: Each player selects one capital territory.</li>
                <li>Playing phase: Players take turns collecting resources, building structures, recruiting units, and expanding their empire.</li>
                <li>Each turn, players can perform one action: build, recruit, or expand.</li>
                <li>Resources are collected automatically at the start of a player's turn.</li>
              </ul>
              
              <h4 className="text-white font-bold">Territories:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Plains: Balanced resources</li>
                <li>Forests: Good for wood production</li>
                <li>Mountains: Good for stone production</li>
                <li>Coast: Good for gold and food</li>
                <li>Capital: Produces extra resources of all types</li>
              </ul>
            </div>
          </>
        );
      
      case "combat":
        return (
          <>
            <h3 className="text-xl font-bold text-white mb-4">Combat History</h3>
            <p className="text-gray-300 text-sm mb-4">
              Combat is currently simplified in this branch. The attacker always wins if they have at least one unit in the attacking territory.
            </p>
            <p className="text-gray-300 text-sm">
              No combat has occurred yet in this game.
            </p>
          </>
        );
      
      case "victory":
        return (
          <>
            <h3 className="text-xl font-bold text-white mb-4">Victory Conditions</h3>
            <div className="space-y-4 text-sm text-gray-300">
              <h4 className="text-white font-bold">Domination Victory</h4>
              <p>Control 75% of all territories on the map.</p>
              
              <h4 className="text-white font-bold">Economic Victory</h4>
              <p>Accumulate 10,000 gold.</p>
              
              <h4 className="text-white font-bold">Military Victory</h4>
              <p>Eliminate all other players by capturing their territories.</p>
              
              <p className="mt-4 text-yellow-400">
                The first player to achieve any of these conditions wins the game!
              </p>
            </div>
          </>
        );
      
      case "events":
        return (
          <>
            <h3 className="text-xl font-bold text-white mb-4">Random Events</h3>
            <p className="text-gray-300 text-sm mb-4">
              Random events are not enabled in this branch of the game. In the full version, events such as natural disasters, resource booms, and diplomatic incidents can occur randomly, affecting gameplay.
            </p>
            <p className="text-gray-300 text-sm">
              Events can be both positive and negative, adding an element of uncertainty to your strategic planning.
            </p>
          </>
        );
      
      case "map":
        return (
          <>
            <h3 className="text-xl font-bold text-white mb-4">Full Map View</h3>
            <p className="text-gray-300 text-sm mb-4">
              Use the mouse wheel to zoom in/out and drag to pan around the map.
            </p>
            <div className="mt-4 space-y-2">
              <h4 className="text-white font-bold">Legend:</h4>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 mr-2"></div>
                <span className="text-gray-300 text-sm">Plains</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-800 mr-2"></div>
                <span className="text-gray-300 text-sm">Forests</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-500 mr-2"></div>
                <span className="text-gray-300 text-sm">Mountains</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-400 mr-2"></div>
                <span className="text-gray-300 text-sm">Coast</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                <span className="text-gray-300 text-sm">Capital</span>
              </div>
            </div>
          </>
        );
      
      default:
        return <p className="text-white">Information not available.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          {renderContent()}
          <Button 
            variant="ghost" 
            size="sm"
            className="absolute top-3 right-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full p-1"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="mt-6 text-right">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
