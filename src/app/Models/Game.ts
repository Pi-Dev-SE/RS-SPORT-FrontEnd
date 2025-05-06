export enum GameStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED'
}

export interface Game {
  gameId?: number;
  matchDate: string;
  status: GameStatus;
  durationMinutes: number;
  homeTeamId?: number;
  awayTeamId?: number;
  gameSheetId?: number;
}

export interface TeamInfo {
  teamId: number;
  teamName: string;
  categorie: string;
}

export interface GameSheetInfo {
  gameSheetId: number;
  homepossessionPercent: number;
  awaypossessionPercent: number;
  homegoal: number;
  awaygoal: number;
  homeshotOnGoal: number;
  awayshotOnGoal: number;
  homefouls: string;
  awayfouls: string;
  homenotes: number;
  awaynotes: number;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
}

export interface GameDto {
  matchId: number;
  matchDate: string;
  status: GameStatus;
  durationMinutes: number;
  homeTeamName?: string; // Made optional as we're populating it from gameSheet
  awayTeamName?: string; // Made optional as we're populating it from gameSheet
  homeTeamId?: number;
  awayTeamId?: number;
  gameSheetId?: number;
  gameSheet?: GameSheetInfo;
  prediction?: MatchPrediction;
}

export interface MatchPrediction {
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  predictedHomeGoals?: number;
  predictedAwayGoals?: number;
}