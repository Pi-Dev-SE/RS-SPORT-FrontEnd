export class User {
    id!: number;
    firstname!: string;
    lastName!: string;
    email!: string;
    password!: string;
    dateOfBirth!: Date;
    enabled!: boolean;
    accountLocked!: boolean;

}
export class user{
    id! : number;
   firstname! : String;
   lastname! : String;
   email! : String;
   password! : String;

   constructor(userId: number, firstname: string, lastname: string, email: string, password: string) {
       this.id = userId;
       this.firstname = firstname;
       this.lastname = lastname;
       this.email = email;
       this.password = password;
   }

}