import { user } from "../../../Models/user";
import { Club, Team } from "../../player/models/player.model";

export class Coach extends user {
  specializationCoach: string;
  diplome: string;
  dateOfBirth?: string;
  coachImage?: string;
  club?: Club;
  team?: Team;
  enabled?: boolean;

  constructor(
    userId: number,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    specializationCoach: string = '',
    diplome: string = '',
    club?: Club,
    team?: Team,
    dateOfBirth: string = '',
    coachImage?: string
  ) {
    super(userId, firstname, lastname, email, password);
    this.specializationCoach = specializationCoach;
    this.diplome = diplome;
    this.club = club;
    this.team = team;
    this.dateOfBirth = dateOfBirth;
    this.coachImage = coachImage;
  }
}