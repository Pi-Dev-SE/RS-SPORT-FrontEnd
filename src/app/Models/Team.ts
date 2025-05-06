import { Player } from "../FrontOffice/player/models/player.model";
import { CATEGORIE } from "./categorie.enum";

export interface Team {
  teamId?: number;
  teamName: string;
  categorie: CATEGORIE;
  clubId?: number;
  coachId?: number;
  players?: Player[];
}

export interface TeamDto {
  teamId?: number;
  teamName: string;
  categorie: CATEGORIE;
  clubId?: number;
  clubName?: string;
  coachId?: number;
  coachName?: string;
  playerCount?: number;
  players?: Player[];
}