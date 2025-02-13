
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

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  category: string;
  requirement_count: number;
  created_at: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: number;
  earned_at: string;
  achievement: Achievement;
}

interface AchievementResponse {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  category: string;
  requirement_count: number;
  created_at: string;
}

interface UserAchievementResponse {
  id: string;
  user_id: string;
  achievement_id: number;
  earned_at: string;
  achievement: AchievementResponse;
}

const Achievements = () => {
  const { user } = useAuth();

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: true }) as { data: AchievementResponse[] | null; error: any };
      
      if (error) throw error;
      if (!data) return [];
      
      return data.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon_name: achievement.icon_name,
        xp_reward: achievement.xp_reward,
        category: achievement.category,
        requirement_count: achievement.requirement_count,
        created_at: achievement.created_at,
      }));
    },
  });

  const { data: userAchievements } = useQuery<UserAchievement[]>({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement(*)')
        .eq('user_id', user?.id) as { data: UserAchievementResponse[] | null; error: any };
      
      if (error) throw error;
      if (!data) return [];
      
      return data.map(ua => ({
        id: ua.id,
        user_id: ua.user_id,
        achievement_id: ua.achievement_id,
        earned_at: ua.earned_at,
        achievement: {
          id: ua.achievement.id,
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon_name: ua.achievement.icon_name,
          xp_reward: ua.achievement.xp_reward,
          category: ua.achievement.category,
          requirement_count: ua.achievement.requirement_count,
          created_at: ua.achievement.created_at,
        },
      }));
    },
    enabled: !!user,
  });

  const earnedAchievements = new Set(userAchievements?.map(ua => ua.achievement_id) ?? []);

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
