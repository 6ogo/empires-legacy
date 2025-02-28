
import React from "react";
import { Button } from "../ui/button";
import { 
  Info, 
  History, 
  Trophy, 
  Flame, 
  Map 
} from "lucide-react";

export const GameMenus: React.FC = () => {
  return (
    <div className="mt-auto">
      <h3 className="text-white text-sm font-bold mb-2">Game Info</h3>
      
      <div className="space-y-1">
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Info className="w-4 h-4 mr-2" />
          Game Rules
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <History className="w-4 h-4 mr-2" />
          Combat History
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Victory Conditions
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Flame className="w-4 h-4 mr-2" />
          Random Events
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Map className="w-4 h-4 mr-2" />
          Full Map View
        </Button>
      </div>
    </div>
  );
};
