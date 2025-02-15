
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";

const xpRewards = [
  { players: 2, participation: 100, victory: 750 },
  { players: 3, participation: 100, victory: 1000 },
  { players: 4, participation: 100, victory: 1250 },
  { players: 5, participation: 100, victory: 1500 },
  { players: 6, participation: 100, victory: 2000 },
];

export const XPRewardsCard = () => {
  return (
    <Card className="bg-white/5 border-white/10 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-game-gold" />
          XP Rewards
        </CardTitle>
        <CardDescription>
          Earn XP by participating in games and achieving victory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-game-gold">Participation Reward</h3>
            <p className="text-gray-400">Earn 100 XP for completing any game</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-game-gold">Victory Rewards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {xpRewards.map((reward) => (
                <div key={reward.players} className="bg-white/10 p-4 rounded-lg">
                  <p className="font-semibold">{reward.players} Player Game</p>
                  <p className="text-game-gold">{reward.victory} XP for victory</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
