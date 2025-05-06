import { Player } from './player.model';

export interface PlayerStatistics {
  plystaId?: number;
  performanceRate: number;
  date: string;
  goalsScored: number;
  assists: number;
  player?: Player;
}