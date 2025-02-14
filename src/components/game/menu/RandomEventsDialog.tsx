
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RandomEvent {
  title: string;
  descriptions: string[];
}

const randomEvents: RandomEvent[] = [
  {
    title: "Resource Events",
    descriptions: [
      "Bountiful Harvest: +50% food production for 2 turns",
      "Gold Rush: +100% gold production for 1 turn",
      "Drought: -30% food production for 3 turns",
      "Trade Boom: +75% trade income for 2 turns"
    ]
  },
  {
    title: "Combat Events",
    descriptions: [
      "Fog of War: Combat visibility reduced for 1 turn",
      "Morale Surge: Units gain +25% combat strength for 1 turn",
      "Supply Line Disruption: Units cost +50% upkeep for 2 turns",
      "Veteran Training: New units start with +1 experience"
    ]
  },
  {
    title: "Territory Events",
    descriptions: [
      "Natural Disaster: Random territory loses 50% production for 1 turn",
      "Border Dispute: Random neutral territory becomes claimable",
      "Resource Discovery: Random territory gains +1 resource production",
      "Cultural Festival: +50% influence generation in a random territory"
    ]
  }
];

interface RandomEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RandomEventsDialog: React.FC<RandomEventsDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4 text-white">Random Events</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-gray-300">
            Random events add an exciting layer of unpredictability to your game, creating unique challenges and opportunities that can dramatically change the course of battle!
          </p>
          {randomEvents.map((category, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-xl font-semibold text-game-gold">{category.title}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {category.descriptions.map((desc, i) => (
                  <li key={i} className="text-white">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RandomEventsDialog;
