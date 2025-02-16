
export type TournamentStatus = 'upcoming' | 'signups' | 'verification' | 'in_progress' | 'completed';
export type TournamentStage = 'country' | 'regional' | 'continental' | 'world';

export interface Tournament {
  id: string;
  status: TournamentStatus;
  stage: TournamentStage;
  regionId: string;
  startTime: string;
  signupStartTime: string;
  verificationStartTime: string;
  maxPlayers: number;
  currentPlayers: number;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentPlayer {
  id: string;
  tournamentId: string;
  userId: string;
  status: string;
  signupTime: string;
  verificationTime?: string;
  eliminated: boolean;
  position?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  roundNumber: number;
  players: {
    id: string;
    username: string;
  }[];
  winnerId?: string;
  gameState: any;
  status: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface TournamentQueue {
  id: string;
  tournamentId: string;
  userId: string;
  position: number;
  joinedAt: string;
}
