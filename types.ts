
export type Choice = 'Rock' | 'Paper' | 'Scissors';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type GamePhase = 'Home' | 'Playing' | 'GameOver';

export interface PlayerStats {
  name: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winStreak: number;
  highStreak: number;
}

export interface GameState {
  playerName: string;
  difficulty: Difficulty;
  phase: GamePhase;
  userScore: number;
  aiScore: number;
  targetScore: number;
  userLastChoice: Choice | null;
  aiLastChoice: Choice | null;
  history: { user: Choice; ai: Choice; winner: 'user' | 'ai' | 'draw' }[];
  message: string;
  roundResult: 'win' | 'lose' | 'draw' | null;
}

export interface LeaderboardEntry {
  name: string;
  highStreak: number;
  wins: number;
}
