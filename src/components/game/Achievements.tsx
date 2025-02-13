
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
import { Progress } from "@/components/ui/progress";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  category: string;
  requirement_count: number;
}

interface UserAchievement {
  id: string;
  achievement_id: number;
  earned_at: string;
  achievement: Achievement;
}

const Achievements = () => {
  const { user } = useAuth();

  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });

  const { data: userAchievements } = useQuery({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user,
  });

  const earnedAchievements = new Set(userAchievements?.map(ua => ua.achievement_id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>Track your progress and earn rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements?.map((achievement) => {
            const earned = earnedAchievements.has(achievement.id);
            // @ts-ignore - dynamic icon import
            const Icon = Icons[achievement.icon_name.replace(/-/g, "")];

            return (
              <Card 
                key={achievement.id}
                className={`relative ${earned ? 'bg-green-900/20' : 'bg-gray-800/20'}`}
              >
                <CardHeader className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {Icon && <Icon className={earned ? "text-green-400" : "text-gray-400"} />}
                    <CardTitle className="text-lg">
                      {achievement.name}
                    </CardTitle>
                  </div>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Reward: {achievement.xp_reward} XP
                  </p>
                  {earned && (
                    <p className="text-sm text-green-400 mt-2">
                      Achieved!
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Achievements;
