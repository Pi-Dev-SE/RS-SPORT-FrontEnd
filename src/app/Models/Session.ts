import { SessionStatus } from "./Enum/SessionStatus";

export class TrainingSession {
    sessionId!: number;
    startDate!: string;  // Format: YYYY-MM-DD
    endDate!: string;
    time!: string;  // Format: HH:mm:ss
    objective!: string;
    sessionStatus!: SessionStatus;
  }
  