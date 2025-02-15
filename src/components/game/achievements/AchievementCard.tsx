
import React from "react";
import { Trophy } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  points: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  progress: number;
  isUnlocked: boolean;
}

export const AchievementCard = ({ achievement, progress, isUnlocked }: AchievementCardProps) => {
  return (
    <div
      className={`p-4 rounded-lg ${
        isUnlocked ? "bg-white/20" : "bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{achievement.title}</h3>
          <p className="text-sm text-gray-400">{achievement.description}</p>
          {!isUnlocked && progress > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-white/10 rounded-full">
                <div
                  className="h-full bg-game-gold rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {progress.toFixed(0)}% complete
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Trophy
            className={`h-5 w-5 ${
              isUnlocked ? "text-game-gold" : "text-gray-500"
            }`}
          />
          <span className={isUnlocked ? "text-game-gold" : "text-gray-500"}>
            {achievement.points} XP
          </span>
        </div>
      </div>
    </div>
  );
};
