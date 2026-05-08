import React, { useMemo } from "react";
import { Resources, Territory } from "@/types/game";
import { BUILDING_INCOME } from "@/lib/game-constants";
import { RESOURCE_CONFIG } from "./ResourceChip";

interface ResourceDisplayProps {
  resources: Resources;
  territories: Territory[];
  currentPlayerId: string;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources, territories, currentPlayerId }) => {
  const income = useMemo(() => {
    const base: Resources = { gold: 0, wood: 0, stone: 0, food: 0 };
    for (const t of territories) {
      if (t.owner !== currentPlayerId || !t.building) continue;
      const inc = BUILDING_INCOME[t.building] ?? {};
      for (const [k, v] of Object.entries(inc) as [keyof Resources, number][]) {
        base[k] += v;
      }
    }
    return base;
  }, [territories, currentPlayerId]);

  return (
    <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full border border-white/10 shadow-lg overflow-hidden">
      {RESOURCE_CONFIG.map(({ key, Icon, colorClass }, i) => (
        <div
          key={key}
          className={`flex items-center gap-1.5 px-3 py-2 ${i < RESOURCE_CONFIG.length - 1 ? "border-r border-white/10" : ""}`}
        >
          <Icon className={`w-4 h-4 ${colorClass} shrink-0`} />
          <span className="font-bold text-sm text-white tabular-nums">{resources[key]}</span>
          {income[key] > 0 && (
            <span className={`text-xs font-medium ${colorClass} opacity-75`}>+{income[key]}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResourceDisplay;
