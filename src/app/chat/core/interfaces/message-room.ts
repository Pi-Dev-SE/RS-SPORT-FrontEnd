import { MessageContent } from "./message-content";
import { MessageRoomMember } from "./message-room-member";

export interface MessageRoom {
  id?: string;
  name?: string;
  isGroup?: boolean;
  createdAt?: string;
  createdById?: string;
  lastMessage?: MessageContent;
  unSeenCount?: number;
  avatarUrl?: string;

  members?: MessageRoomMember[];
  messages?: MessageContent[];
}
