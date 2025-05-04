import { User } from './user';
export class Admin extends User {
  department!: string;
  adminLevel!: string;
}
