import { TypeStatusRegime } from "./type-status-regime";


export class RecoveryRegime {
    generatedAt!: Date;
    dailyDuration!: number;
    recommendedExercie!: String
    exerciseIntensity!: String;
    dietRecommendation!: String;
    physiotherapyRequired!: boolean;
    progressTracking!: String;
    status!: TypeStatusRegime;
}



