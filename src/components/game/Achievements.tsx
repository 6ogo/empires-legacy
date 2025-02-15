
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { XPRewardsCard } from "./achievements/XPRewardsCard";
import { CategorySection } from "./achievements/CategorySection";
import type { Achievement, UserAchievement } from "./achievements/types";

const Achievements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });

  const { data: userAchievements } = useQuery({
    queryKey: ["user_achievements", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id, progress")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data.map((ua) => ({
        achievementId: ua.achievement_id,
        progress: ua.progress,
      })) as UserAchievement[];
    },
    enabled: !!user,
  });

  const achievementsByCategory = achievements?.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>) || {};

  return (
    <div className="min-h-screen bg-[#141B2C] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-game-gold">Achievements</h1>
        </div>

        <XPRewardsCard />

        <div className="grid gap-6">
          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
            <CategorySection
              key={category}
              category={category}
              achievements={categoryAchievements}
              userAchievements={userAchievements || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
