import { Player } from '../FrontOffice/player/models/player.model';
import { Team } from './Team';


// Response structure from the API
export interface GameSheetResponse {
  gameSheet: GameSheet;
  homeTeamPlayers: Player[];
  awayTeamPlayers: Player[];
}

export interface GameSheet {
  gameSheetId?: number;
  homepossessionPercent: number;
  awaypossessionPercent: number;
  homegoal: number;
  awaygoal: number;
  homeshotOnGoal: number;
  awayshotOnGoal: number;
  homefouls: string;
  awayfouls: string;
  homenotes: number;  // Performance rating (0-10)
  awaynotes: number;  // Performance rating (0-10)
  homeTeam?: Team;
  awayTeam?: Team;
}