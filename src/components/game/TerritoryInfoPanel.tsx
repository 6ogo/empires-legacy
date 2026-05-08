import React from "react";
import { Territory, Resources } from "@/types/game";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { X, Heart, Sword } from "lucide-react";
import { BUILDING_INCOME } from "@/lib/game-constants";
import { militaryUnits } from "@/data/military-units";
import { RESOURCE_CONFIG, ResourceChip } from "./ResourceChip";
import BuildingMenu from "./BuildingMenu";
import RecruitmentMenu from "./RecruitmentMenu";

const PLAYER_STROKE: Record<string, string> = {
  player1: "#9F7AEA",
  player2: "#F8BB5C",
  player3: "#48BB78",
  player4: "#42A0E1",
  player5: "#F56565",
  player6: "#ECC94B",
};

const TERRAIN_LABEL: Record<string, string> = {
  plains:    "Plains",
  forest:    "Forest",
  hills:     "Hills",
  mountains: "Mountains",
  river:     "River",
};

interface TerritoryInfoPanelProps {
  territory: Territory | null;
  phase: string;
  currentPlayerId: string;
  resources: Resources;
  onClose: () => void;
  onBuild: (buildingType: string) => void;
  onRecruit: (unitType: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
    {children}
  </div>
);

const TerritoryInfoPanel: React.FC<TerritoryInfoPanelProps> = ({
  territory,
  phase,
  currentPlayerId,
  resources,
  onClose,
  onBuild,
  onRecruit,
}) => {
  if (!territory) return null;

  const isOwned = territory.owner === currentPlayerId;
  const unitData = territory.militaryUnit
    ? militaryUnits[territory.militaryUnit.type.toUpperCase()]
    : null;
  const maxHealth = unitData?.health ?? 100;

  const buildingIncome = territory.building ? BUILDING_INCOME[territory.building] : null;

  const showBuildMenu =
    isOwned &&
    phase === "building" &&
    !territory.building;

  const showRecruitMenu =
    isOwned &&
    phase === "recruitment" &&
    territory.building === "barracks" &&
    !territory.militaryUnit;

  return (
    <>
      {/* Desktop: right sidebar */}
      <div className="
        fixed z-40
        right-0 top-14 bottom-0 w-72
        bg-gray-900/95 backdrop-blur-md border-l border-white/10
        flex flex-col
        hidden md:flex
      ">
        <PanelContent
          territory={territory}
          isOwned={isOwned}
          unitData={unitData}
          maxHealth={maxHealth}
          buildingIncome={buildingIncome}
          resources={resources}
          currentPlayerId={currentPlayerId}
          showBuildMenu={showBuildMenu}
          showRecruitMenu={showRecruitMenu}
          onClose={onClose}
          onBuild={onBuild}
          onRecruit={onRecruit}
        />
      </div>

      {/* Mobile: bottom sheet */}
      <div className="
        fixed z-40
        bottom-0 left-0 right-0 h-64
        bg-gray-900/95 backdrop-blur-md border-t border-white/10
        flex flex-col
        md:hidden
      ">
        <PanelContent
          territory={territory}
          isOwned={isOwned}
          unitData={unitData}
          maxHealth={maxHealth}
          buildingIncome={buildingIncome}
          resources={resources}
          currentPlayerId={currentPlayerId}
          showBuildMenu={showBuildMenu}
          showRecruitMenu={showRecruitMenu}
          onClose={onClose}
          onBuild={onBuild}
          onRecruit={onRecruit}
        />
      </div>
    </>
  );
};

interface PanelContentProps {
  territory: Territory;
  isOwned: boolean;
  unitData: ReturnType<typeof Object.values<typeof militaryUnits>>[0] | null;
  maxHealth: number;
  buildingIncome: Partial<Resources> | null;
  resources: Resources;
  currentPlayerId: string;
  showBuildMenu: boolean;
  showRecruitMenu: boolean;
  onClose: () => void;
  onBuild: (buildingType: string) => void;
  onRecruit: (unitType: string) => void;
}

const PanelContent: React.FC<PanelContentProps> = ({
  territory,
  isOwned,
  unitData,
  maxHealth,
  buildingIncome,
  resources,
  currentPlayerId,
  showBuildMenu,
  showRecruitMenu,
  onClose,
  onBuild,
  onRecruit,
}) => (
  <>
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
      <div className="flex items-center gap-2">
        {territory.owner && (
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: PLAYER_STROKE[territory.owner] ?? "#6B7280" }}
          />
        )}
        <div>
          <p className="font-semibold text-white text-sm">
            {TERRAIN_LABEL[territory.terrain] ?? territory.terrain}
          </p>
          <p className="text-xs text-gray-400">
            {territory.owner
              ? isOwned ? "Your territory" : `${territory.owner}'s territory`
              : "Unclaimed"}
          </p>
        </div>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
        <X className="w-4 h-4" />
      </button>
    </div>

    {/* Scrollable body */}
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">

        {/* Territory resources */}
        <Section title="Resources">
          <div className="grid grid-cols-2 gap-1.5">
            {RESOURCE_CONFIG.map(({ key, Icon, colorClass, label }) => (
              <div key={key} className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-2">
                <Icon className={`w-3.5 h-3.5 ${colorClass} shrink-0`} />
                <span className="text-xs text-gray-300">{label}</span>
                <span className="text-xs font-semibold text-white ml-auto">{territory.resources[key]}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Building */}
        {territory.building && (
          <>
            <Separator className="bg-white/10" />
            <Section title="Building">
              <div className="flex items-start gap-2.5 bg-white/5 rounded-lg p-3">
                <div className="w-2 h-2 rounded-full bg-game-gold mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-white capitalize">
                    {territory.building.replace(/_/g, " ")}
                  </p>
                  {buildingIncome && Object.keys(buildingIncome).length > 0 ? (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Income:{" "}
                      {Object.entries(buildingIncome)
                        .map(([k, v]) => `+${v} ${k}`)
                        .join(", ")}
                      /turn
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">No resource income</p>
                  )}
                </div>
              </div>
            </Section>
          </>
        )}

        {/* Military unit */}
        {territory.militaryUnit && (
          <>
            <Separator className="bg-white/10" />
            <Section title="Military Unit">
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-white capitalize">
                    {territory.militaryUnit.type}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-red-400">
                      <Heart className="w-3 h-3" /> {territory.militaryUnit.health}
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <Sword className="w-3 h-3" /> {territory.militaryUnit.damage}
                    </span>
                  </div>
                </div>
                <Progress
                  value={(territory.militaryUnit.health / maxHealth) * 100}
                  className="h-1.5 bg-white/10"
                />
                {unitData?.description && (
                  <p className="text-xs text-gray-400">{unitData.description}</p>
                )}
                {territory.militaryUnit.hasMoved && (
                  <p className="text-xs text-yellow-400">Unit has already moved this turn</p>
                )}
              </div>
            </Section>
          </>
        )}

        {/* Build actions */}
        {showBuildMenu && (
          <>
            <Separator className="bg-white/10" />
            <Section title="Build">
              <BuildingMenu
                onBuild={onBuild}
                resources={resources}
                selectedTerritory={territory}
                currentPlayerId={currentPlayerId}
              />
            </Section>
          </>
        )}

        {/* Recruit actions */}
        {showRecruitMenu && (
          <>
            <Separator className="bg-white/10" />
            <Section title="Recruit Unit">
              <RecruitmentMenu
                onRecruit={onRecruit}
                resources={resources}
                selectedTerritory={territory}
              />
            </Section>
          </>
        )}

        {/* Context hint */}
        {isOwned && !showBuildMenu && !showRecruitMenu && phase !== "end" && (
          <p className="text-xs text-gray-500 text-center">
            {phase === "setup" && "Setup phase — claim territories"}
            {phase === "building" && (territory.building ? "Territory already has a building" : "Switch to building phase to build here")}
            {phase === "recruitment" && territory.building !== "barracks" && "Build a Barracks to recruit units here"}
            {phase === "recruitment" && territory.building === "barracks" && territory.militaryUnit && "Territory already has a unit"}
            {phase === "combat" && "Select this territory to attack from, or as an attack target"}
          </p>
        )}

      </div>
    </ScrollArea>
  </>
);

export default TerritoryInfoPanel;
