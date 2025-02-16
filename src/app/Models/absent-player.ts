import { Player } from './player';
import { Session } from './Session';

export class AbsentPlayer {
    absenceId!: number;
    absenceDate!: Date;
    reason!: string;
    player!: Player; // Lien vers le joueur absent
    session!: Session; // Lien vers la session concernée

   
}