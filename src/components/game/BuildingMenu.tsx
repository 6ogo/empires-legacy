
import React from "react";
import { Resources, Territory } from "@/types/game";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Store, 
  Warehouse, 
  Building2, 
  Sword,
  TreeDeciduous,
  Mountain,
  GalleryThumbnails,
  Castle,
  Road
} from "lucide-react";

interface BuildingMenuProps {
  onBuild: (buildingType: string) => void;
  resources: Resources;
  selectedTerritory: Territory | null;
}

const buildings = [
  {
    id: "lumber_mill",
    name: "Lumber Mill",
    icon: TreeDeciduous,
    cost: { gold: 50, wood: 20 },
    description: "+2 wood per turn",
    requiresResource: "wood",
  },
  {
    id: "mine",
    name: "Mine",
    icon: Mountain,
    cost: { gold: 50, stone: 20 },
    description: "+2 stone per turn",
    requiresResource: "stone",
  },
  {
    id: "market",
    name: "Market",
    icon: Store,
    cost: { gold: 100, wood: 30 },
    description: "+2 gold per turn",
  },
  {
    id: "farm",
    name: "Farm",
    icon: GalleryThumbnails,
    cost: { gold: 50, wood: 20 },
    description: "+2 food per turn",
  },
  {
    id: "road",
    name: "Road",
    icon: Road,
    cost: { wood: 25, stone: 25 },
    description: "Allows territory expansion",
  },
  {
    id: "barracks",
    name: "Barracks",
    icon: Sword,
    cost: { gold: 150, wood: 50, stone: 50 },
    description: "Enables unit training",
  },
  {
    id: "fortress",
    name: "Fortress",
    icon: Castle,
    cost: { gold: 300, stone: 150 },
    description: "+50% defense",
  },
];

const BuildingMenu: React.FC<BuildingMenuProps> = ({ onBuild, resources, selectedTerritory }) => {
  const canAfford = (costs: Partial<Resources>) => {
    return Object.entries(costs).every(
      ([resource, cost]) => resources[resource as keyof Resources] >= cost
    );
  };

  const canBuildOnTerritory = (building: typeof buildings[0]) => {
    if (!selectedTerritory) {
      toast.error("Please select a territory first!");
      return false;
    }

    // Check building count limit
    const buildingCount = (selectedTerritory.buildings || []).length;
    if (buildingCount >= 2) {
      toast.error("Maximum of 2 buildings per territory reached!");
      return false;
    }

    // Check if territory has required resource for resource buildings
    if (building.requiresResource) {
      const hasResource = selectedTerritory.resources[building.requiresResource as keyof Resources] > 0;
      if (!hasResource) {
        toast.error(`This territory has no ${building.requiresResource} resources!`);
        return false;
      }
    }

    // Check if player can afford the building
    if (!canAfford(building.cost)) {
      toast.error("Insufficient resources!");
      return false;
    }

    return true;
  };

  const handleBuildClick = (building: typeof buildings[0]) => {
    if (canBuildOnTerritory(building)) {
      onBuild(building.id);
    }
  };

  return (
    <ScrollArea className="h-[300px] bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-game-gold">Buildings</h3>
        <div className="grid gap-3">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <building.icon className="w-5 h-5 text-game-gold" />
                  <div>
                    <h4 className="font-medium">{building.name}</h4>
                    <p className="text-sm text-gray-400">{building.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleBuildClick(building)}
                  disabled={!selectedTerritory || !canAfford(building.cost)}
                  className="ml-2"
                >
                  Build
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Cost: {Object.entries(building.cost).map(([resource, amount], i) => (
                  <span key={resource}>
                    {i > 0 && ", "}
                    {amount} {resource}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default BuildingMenu;
