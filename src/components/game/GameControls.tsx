import React from "react";
import { Button } from "@/components/ui/button";
import { GameState, GamePhase } from "@/types/game";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  gameState: GameState;
  onEndTurn: () => void;
  onEndPhase: () => void;
  onGiveUp: () => void;
}

const PHASES: GamePhase[] = ["setup", "building", "recruitment", "combat"];

const PHASE_LABELS: Record<string, string> = {
  setup:       "Setup",
  building:    "Build",
  recruitment: "Recruit",
  combat:      "Combat",
};

const PHASE_ACTIONS: Record<string, string> = {
  setup:       "Finish Setup",
  building:    "End Building",
  recruitment: "End Recruitment",
  combat:      "End Combat",
};

const GameControls: React.FC<GameControlsProps> = ({ gameState, onEndTurn, onEndPhase, onGiveUp }) => {
  const currentIndex = PHASES.indexOf(gameState.phase as GamePhase);

  return (
    <div className="flex flex-col gap-3 p-3 bg-black/60 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
      {/* Turn + phase header */}
      <div className="text-xs text-gray-400 text-center">
        Turn <span className="text-white font-semibold">{gameState.turn}</span>
        {" · "}
        <span className="text-game-gold font-semibold capitalize">{PHASE_LABELS[gameState.phase] ?? gameState.phase}</span> phase
        {" · "}
        <span className="text-white capitalize">{gameState.currentPlayer}</span>
      </div>

      {/* Phase progress dots */}
      <div className="flex items-center gap-1">
        {PHASES.map((p, i) => (
          <React.Fragment key={p}>
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full border transition-colors duration-200",
                i < currentIndex  ? "bg-game-gold border-game-gold" :
                i === currentIndex ? "bg-white border-white ring-2 ring-white/30" :
                                     "bg-transparent border-white/30"
              )}
              title={PHASE_LABELS[p]}
            />
            {i < PHASES.length - 1 && (
              <div className={cn("flex-1 h-px transition-colors duration-200",
                i < currentIndex ? "bg-game-gold" : "bg-white/20"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Phase labels */}
      <div className="flex justify-between text-xs text-gray-500">
        {PHASES.map((p, i) => (
          <span
            key={p}
            className={cn(i === currentIndex ? "text-white font-medium" : "")}
            style={{ width: "25%", textAlign: i === 0 ? "left" : i === PHASES.length - 1 ? "right" : "center" }}
          >
            {PHASE_LABELS[p]}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onEndPhase}
          className="flex-1 text-xs h-9 hover:bg-white/10 border-white/20"
        >
          {PHASE_ACTIONS[gameState.phase] ?? "Next Phase"}
        </Button>
        <Button
          onClick={onEndTurn}
          className="flex-1 text-xs h-9 bg-game-gold hover:bg-game-gold/90 text-black font-bold"
        >
          End Turn
        </Button>
      </div>

      {/* Give up — deemphasized */}
      <div className="flex justify-center">
        <button
          onClick={onGiveUp}
          className="text-xs text-red-400/70 hover:text-red-400 transition-colors hover:underline underline-offset-2"
        >
          Give Up
        </button>
      </div>
    </div>
  );
};

export default GameControls;
