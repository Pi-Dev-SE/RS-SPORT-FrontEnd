export enum TypeStatusHealth {
  ACTIVE = 'ACTIVE',
  INJURED = 'INJURED',
  RECOVERING = 'RECOVERING'
}

export enum TypeInjurySeverity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE'
}

export interface HealthReport {
  id: number;
  healthId?: number;
  injuryType?: string;
  injurySeverity?: TypeInjurySeverity;
  status?: TypeStatusHealth;
}

export interface Club {
  id: number;
  clubId?: number;
  clubName?: string;
  clubDescription?: string;
}

export interface Team {
  teamId: number;
  name?: string;
}

export interface Player {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  dateOfBirth: string;
  enabled: boolean;
  accountLocked: boolean;
  role: string;
  createdDate?: string;
  lastModifiedDate?: string;
  position: string;
  jerseyNumber: number;
  playerImage: any; // Can be string (filename) or File object when uploading
  imageUrl?: string; // Added for storing the full image URL from API
  healthStatus: TypeStatusHealth | null;
  healthReport?: HealthReport;
  club?: Club;
  team?: Team;
}