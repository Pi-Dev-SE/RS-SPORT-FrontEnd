import { Coach } from "../../coach/models/coach.model";

export interface Club {
  clubId?: number;
  clubName: string;
  clubDescription: string;
  clubImage: string;
  clubAddress: string;
  clubCity: string;
  // players?: Player[];
  coaches?: Coach[];
  teams?: Team[];
}

export interface Player {
  playerId: number;
  // Add other player properties as needed
}



export interface Team {
  teamId: number;
  teamName: string;
  players?: any[];
  coaches?: Coach[];
  matches?: any[];
  // Add other team properties as needed
}
