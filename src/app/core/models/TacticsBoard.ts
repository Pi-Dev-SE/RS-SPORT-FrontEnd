import { Position } from "src/app/FrontOffice/tactic/tactics-board.service";

export class TacticsBoard {
  idTactic?: number;
  name!: string;
  formation!: { [key: string]: Position };
  createdAt?: Date;
  homeTeam?: any;
  awayTeam?: any;
  version?: number;
}
