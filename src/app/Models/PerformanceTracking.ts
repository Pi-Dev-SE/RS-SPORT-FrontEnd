export class PerformanceTracking {
    id!:number;
    dateSuivi!: Date;
    douleur!: number;
    endurance!: number;
    apteAReprendre!: boolean;
    frequenceCardiaque!: number;
    poids!: number;
    indiceFatigue!: number;
    playerId!: number;
    scoreProgression: any;
    tauxRecuperationEstime: number | undefined;
    niveauRisque: 'LOW' | 'MEDIUM' | 'HIGH' | undefined;
     messageAvertissement : string | undefined;
}