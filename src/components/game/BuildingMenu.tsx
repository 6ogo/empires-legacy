import React from "react";
import { Resources, Territory } from "@/types/game";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResourceChip } from "./ResourceChip";
import {
  Store,
  TreeDeciduous,
  Mountain,
  GalleryThumbnails,
  Castle,
  ArrowUpDown,
  Sword,
} from "lucide-react";

interface BuildingMenuProps {
  onBuild: (buildingType: string) => void;
  resources: Resources;
  selectedTerritory: Territory | null;
  currentPlayerId?: string;
}

const buildings = [
  { id: "lumber_mill", name: "Lumber Mill",       icon: TreeDeciduous, cost: { gold: 50, wood: 20 },              description: "+5 wood/turn",        requiresResource: "wood"  },
  { id: "mine",        name: "Mine",               icon: Mountain,      cost: { gold: 50, stone: 20 },             description: "+5 stone/turn",       requiresResource: "stone" },
  { id: "market",      name: "Market",             icon: Store,         cost: { gold: 100, wood: 30 },             description: "+5 gold/turn"                                    },
  { id: "farm",        name: "Farm",               icon: GalleryThumbnails, cost: { gold: 50, wood: 20 },          description: "+5 food/turn"                                    },
  { id: "barracks",    name: "Barracks",           icon: Sword,         cost: { gold: 150, wood: 50, stone: 50 },  description: "Enables unit training"                           },
  { id: "fortress",    name: "Fortress",           icon: Castle,        cost: { gold: 300, stone: 150 },           description: "+50% defense"                                    },
  { id: "expand",      name: "Expand Territory",   icon: ArrowUpDown,   cost: { wood: 25, stone: 25 },             description: "Claim adjacent territory"                        },
];

const BuildingMenu: React.FC<BuildingMenuProps> = ({ onBuild, resources, selectedTerritory, currentPlayerId }) => {
  const canAfford = (costs: Partial<Resources>) =>
    Object.entries(costs).every(([r, c]) => (resources[r as keyof Resources] ?? 0) >= (c ?? 0));

  const handleBuildClick = (building: typeof buildings[0]) => {
    if (!selectedTerritory) { toast.error("Select a territory first"); return; }
    if (currentPlayerId && selectedTerritory.owner !== currentPlayerId) { toast.error("You can only build on your own territories"); return; }
    if (building.id !== "expand" && selectedTerritory.building) { toast.error("Territory already has a building"); return; }
    if (building.requiresResource && !selectedTerritory.resources[building.requiresResource as keyof Resources]) {
      toast.error(`Territory has no ${building.requiresResource}`); return;
    }
    if (!canAfford(building.cost)) { toast.error("Insufficient resources"); return; }
    onBuild(building.id);
  };

  return (
    <div className="space-y-2">
      {buildings.map((building) => {
        const affordable = canAfford(building.cost);
        return (
          <div key={building.id} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <building.icon className="w-4 h-4 text-game-gold mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-white">{building.name}</p>
                  <p className="text-xs text-gray-400">{building.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {Object.entries(building.cost).map(([res, amt]) => (
                      <ResourceChip
                        key={res}
                        resource={res as keyof Resources}
                        amount={amt!}
                        affordable={(resources[res as keyof Resources] ?? 0) >= amt!}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleBuildClick(building)}
                disabled={!selectedTerritory || !affordable}
                className="shrink-0 h-7 text-xs"
              >
                Build
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BuildingMenu;
