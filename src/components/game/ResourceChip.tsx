import React from "react";
import { Coins, Trees, Mountain, Wheat } from "lucide-react";
import { Resources } from "@/types/game";
import { cn } from "@/lib/utils";

export const RESOURCE_CONFIG = [
  { key: "gold"  as const, Icon: Coins,    colorClass: "text-game-gold",  label: "Gold"  },
  { key: "wood"  as const, Icon: Trees,    colorClass: "text-game-wood",  label: "Wood"  },
  { key: "stone" as const, Icon: Mountain, colorClass: "text-game-stone", label: "Stone" },
  { key: "food"  as const, Icon: Wheat,    colorClass: "text-game-food",  label: "Food"  },
] as const;

interface ResourceChipProps {
  resource: keyof Resources;
  amount: number;
  affordable?: boolean;
}

export const ResourceChip: React.FC<ResourceChipProps> = ({ resource, amount, affordable }) => {
  const config = RESOURCE_CONFIG.find(r => r.key === resource)!;
  const canAfford = affordable === undefined || affordable;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold border",
      canAfford
        ? cn("bg-black/30 border-current", config.colorClass)
        : "bg-red-950/50 border-red-500/40 text-red-400"
    )}>
      <config.Icon className="w-3 h-3" />
      {amount}
    </span>
  );
};
