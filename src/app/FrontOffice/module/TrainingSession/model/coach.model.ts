
export interface Coach {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dateOfBirth?: string; // Utilisez string pour simplifier la sérialisation JSON
  enabled?: boolean;
  accountLocked?: boolean;
}