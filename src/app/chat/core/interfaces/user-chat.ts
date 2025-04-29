export interface User {
  firstname?: string;
  password?: string;
  status?: Status;
  avatarUrl?: string;
}

export enum Status {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}
