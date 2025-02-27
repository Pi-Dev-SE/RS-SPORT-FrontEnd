import { ExerciseType } from "./Enum/ExerciseType";

export class Exercise {
    id!: number;
    name!: string;
    exerciseType!: ExerciseType;
    description!: string;
    duration!: string;
    objectif!: string;
    image!: string;
    creationDate!: Date;
  }