
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Territory, Resources, MilitaryUnit } from "@/types/game";
import { toast } from "sonner";
import { Shield, Sword, Heart } from "lucide-react";
import { militaryUnits } from "@/data/military-units";

interface RecruitmentMenuProps {
  onRecruit: (unitType: string) => void;
  resources: Resources;
  selectedTerritory: Territory | null;
}

const RecruitmentMenu: React.FC<RecruitmentMenuProps> = ({
  onRecruit,
  resources,
  selectedTerritory,
}) => {
  const canAfford = (costs: Partial<Resources>) => {
    return Object.entries(costs).every(
      ([resource, cost]) => resources[resource as keyof Resources] >= (cost || 0)
    );
  };

  const canRecruitInTerritory = (unit: MilitaryUnit) => {
    if (!selectedTerritory) {
      toast.error("Please select a territory first!");
      return false;
    }

    if (selectedTerritory.militaryUnit) {
      toast.error("This territory already has a military unit!");
      return false;
    }

    if (!canAfford(unit.cost)) {
      toast.error("Insufficient resources!");
      return false;
    }

    return true;
  };

  const handleRecruitClick = (unitType: string) => {
    const unit = militaryUnits[unitType];
    if (canRecruitInTerritory(unit)) {
      onRecruit(unitType);
    }
  };

  return (
    <ScrollArea className="h-[300px] bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-game-gold">Military Units</h3>
        <div className="grid gap-3">
          {Object.entries(militaryUnits).map(([unitType, unit]) => (
            <div
              key={unitType}
              className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2 items-center">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>{unit.health}</span>
                    <Sword className="w-4 h-4 text-blue-400" />
                    <span>{unit.damage}</span>
                  </div>
                  <div>
                    <h4 className="font-medium capitalize">{unit.type}</h4>
                    <p className="text-sm text-gray-400">
                      Cost: {Object.entries(unit.cost).map(([resource, amount], i) => (
                        <span key={resource}>
                          {i > 0 && ", "}
                          {amount} {resource}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleRecruitClick(unitType)}
                  disabled={!selectedTerritory || !canAfford(unit.cost)}
                  className="ml-2"
                >
                  Recruit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default RecruitmentMenu;
