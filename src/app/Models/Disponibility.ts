import { Absent } from "./Enum/Absent";

export class Disponibility {
    id!: number;
    isPresent!: boolean;
    description!: string;
    absent!: Absent;
  }