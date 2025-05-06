import { Team } from './Team';

export interface TeamStatistics {
  teamstaId?: number;
  performanceRate: number;
  totalWins: number;
  totalLosses: number;
  date: string;
  rankingPoints: number;
  team?: Team;
}