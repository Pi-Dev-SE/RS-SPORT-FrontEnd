export enum ExerciseType {
  PHYSICAL = 'PHYSICAL',
  TECHNICAL = 'TECHNICAL',
  TACTICAL = 'TACTICAL',
  CONDITIONING = 'CONDITIONING'
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface Exercise {
  secondRating?: any;
  firstRating?: any;
  yourRating?: number;
  id: number;
imageUrl: any;
type: string;
  name: string;
  exerciseType: ExerciseType;
  description: string;
  duration: string;
  objectif: string;
  image: string;
  videoUrl: string;
  visibility: Visibility;
  creationDate: string;
  rating: number;
  completed: boolean; // Champ pour l'état de complétion
  averageRating?: number; // ✅ ici
  tempRating?: number;
  displayOrder?: number; // Mis à jour pour utiliser displayOrder

 
  
}


