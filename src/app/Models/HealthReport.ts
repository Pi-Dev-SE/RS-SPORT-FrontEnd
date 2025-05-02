import { TypeInjurySeverity } from './type-injury-severity';

import { TypeStatusHealth } from './type-status-health';


export class HealthReport {
healthId!:number;
injuryType!: string;
injurySeverity!: TypeInjurySeverity;
diagnosisDate!: Date;
expectedRecoveryDate!: Date;
recoveryPlan!: String;
fitnessLevel!: String;
medicalNotes!: String;
status!: TypeStatusHealth;
staffId!:number;
playerId!:number;
regimeId!:number;
firstNameMed!:string;
firstNamePlay!:string;



}



