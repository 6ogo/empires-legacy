import React from "react";
import { Territory, Resources } from "@/types/game";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Sword } from "lucide-react";
import { militaryUnits } from "@/data/military-units";
import { ResourceChip } from "./ResourceChip";

interface RecruitmentMenuProps {
  onRecruit: (unitType: string) => void;
  resources: Resources;
  selectedTerritory: Territory | null;
}

const RecruitmentMenu: React.FC<RecruitmentMenuProps> = ({ onRecruit, resources, selectedTerritory }) => {
  const canAfford = (costs: Partial<Resources>) =>
    Object.entries(costs).every(([r, c]) => (resources[r as keyof Resources] ?? 0) >= (c ?? 0));

  const handleRecruitClick = (unitType: string) => {
    const unit = militaryUnits[unitType];
    if (!selectedTerritory) { toast.error("Select a territory first"); return; }
    if (selectedTerritory.militaryUnit) { toast.error("Territory already has a unit"); return; }
    if (!canAfford(unit.cost)) { toast.error("Insufficient resources"); return; }
    onRecruit(unitType);
  };

  return (
    <div className="space-y-2">
      {Object.entries(militaryUnits).map(([unitType, unit]) => {
        const affordable = canAfford(unit.cost);
        return (
          <div key={unitType} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm text-white capitalize">{unit.type}</p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="flex items-center gap-1 text-red-400">
                    <Heart className="w-3 h-3" /> {unit.health}
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <Sword className="w-3 h-3" /> {unit.damage}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {Object.entries(unit.cost).map(([res, amt]) => (
                    <ResourceChip
                      key={res}
                      resource={res as keyof Resources}
                      amount={amt!}
                      affordable={(resources[res as keyof Resources] ?? 0) >= amt!}
                    />
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleRecruitClick(unitType)}
                disabled={!selectedTerritory || !affordable}
                className="shrink-0 h-7 text-xs"
              >
                Recruit
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecruitmentMenu;
