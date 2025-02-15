
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

export const ACHIEVEMENTS = {
  WORLD_EMPEROR: {
    id: 999,
    title: "World Emperor",
    description: "Win the World War Tournament and become the ultimate ruler",
    category: "game",
    points: 10000,
  }
} as const;
