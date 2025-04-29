import { TypeInjurySeverity } from './type-injury-severity';

import { TypeStatusHealth } from './type-status-health';


export class HealthReport {
injuryType!: string;
injurySeverity!: TypeInjurySeverity;
diagnosisDate!: Date;
expectedRecoveryDate!: Date;
recoveryPlan!: String;
fitnessLevel!: String;
medicalNotes!: String;
status!: TypeStatusHealth;


}



