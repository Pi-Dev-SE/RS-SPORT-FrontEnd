import { SessionStatus } from "./session-status";
export class Session {
    id!: number;
    date!: string;  // Format YYYY-MM-DD
    time!: string;  // Format HH:mm:ss
    duration!: number; // Durée en minutes
    status!: SessionStatus;
}