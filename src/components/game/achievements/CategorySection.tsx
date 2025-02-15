
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Swords, Building2, Sparkles } from "lucide-react";
import { AchievementCard } from "./AchievementCard";

interface Achievement {
  id: number;
  title: string;
  description: string;
  category: string;
  points: number;
}

interface CategorySectionProps {
  category: string;
  achievements: Achievement[];
  userAchievements: { achievementId: number; progress: number }[];
}

const categoryIcons: Record<string, React.ElementType> = {
  game: Trophy,
  resource: Medal,
  military: Swords,
  building: Building2,
  social: Sparkles,
};

export const CategorySection = ({ category, achievements, userAchievements }: CategorySectionProps) => {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          {React.createElement(categoryIcons[category] || Trophy, {
            className: "h-6 w-6 text-game-gold",
          })}
          <CardTitle className="capitalize">{category} Achievements</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-full">
          <div className="grid gap-4">
            {achievements.map((achievement) => {
              const userAchievement = userAchievements?.find(
                (ua) => ua.achievementId === achievement.id
              );
              const progress = userAchievement?.progress || 0;
              const isUnlocked = progress >= 100;

              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  progress={progress}
                  isUnlocked={isUnlocked}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
