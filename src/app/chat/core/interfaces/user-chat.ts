export interface User {
  firstname?: string;
  email?: string;
  password?: string;
  status?: Status;
  avatarUrl?: string;
}

export enum Status {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}
