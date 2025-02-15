
export interface Achievement {
  id: number;
  title: string;
  description: string;
  category: string;
  points: number;
  created_at: string;
}

export interface UserAchievement {
  achievementId: number;
  progress: number;
}
