import { TypeStatusRegime } from "./type-status-regime";


export class RecoveryRegime {
    healthId!:number;
    regimeId!: number;
    generatedAt!: Date;
    dailyDuration!: number;
    recommendedExercise!: String
    exerciseIntensity!: String;
    dietRecommendation!: String;
    physiotherapyRequired!: boolean;
    progressTracking!: String;
    status!: TypeStatusRegime;
    firstname!:string;
    playerId!: number;
}



