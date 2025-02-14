
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Icons from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, Medal, Swords, Building2, Sparkles } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  category: string;
  points: number;
  created_at: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  general: Trophy,
  economy: Medal,
  military: Swords,
  territory: Building2,
  unique: Sparkles,
};

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
        .select("achievement_id")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data.map((ua) => ua.achievement_id);
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

        <div className="grid gap-6">
          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
            <Card key={category} className="bg-white/5 border-white/10">
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
                    {categoryAchievements.map((achievement) => {
                      const isUnlocked = userAchievements?.includes(achievement.id);
                      return (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg ${
                            isUnlocked ? "bg-white/20" : "bg-white/5"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {achievement.title}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {achievement.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy
                                className={`h-5 w-5 ${
                                  isUnlocked ? "text-game-gold" : "text-gray-500"
                                }`}
                              />
                              <span
                                className={
                                  isUnlocked ? "text-game-gold" : "text-gray-500"
                                }
                              >
                                {achievement.points} XP
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
