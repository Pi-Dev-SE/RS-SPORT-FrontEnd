import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageContent, MessageType } from 'src/app/chat/core/interfaces/message-content';
import { MessageRoom } from 'src/app/chat/core/interfaces/message-room';
import { MessageRoomMember } from 'src/app/chat/core/interfaces/message-room-member';
import { User } from 'src/app/chat/core/interfaces/user-chat';
import { MessageContentService } from 'src/app/chat/core/services/message-content.service';
import { MessageRoomMemberService } from 'src/app/chat/core/services/message-room-member.service';
import { MessageRoomService } from 'src/app/chat/core/services/message-room.service';
import { ThemeService } from 'src/app/chat/core/services/theme.service';
import { UserService } from 'src/app/chat/core/services/user.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})

export class MessagesComponent {
  currentUser: User = {} as User;

  visible: boolean = false;
  addMembersVisible: boolean = false;
  editMemberVisible: boolean = false;

  selectedRoom!: MessageRoom;
  selectedMember: MessageRoomMember | undefined;

  message: MessageContent = {} as MessageContent;
  currentMemberLastSeen: string = '';
  currentMember: MessageRoomMember = {} as MessageRoomMember;

  themeMode: boolean = this.themeService.getThemeMode() === 'dark';
  themeColor: any = this.themeService.getThemeColorObjectByName(this.themeService.getThemeColor());
  themeColors = this.themeService.getThemes();

  visibleEmojiPicker: boolean = false;

  editGroupNameVisible: boolean = false;
  newGroupName: string = '';

  constructor(
    public userService: UserService,
    private router: Router,
    private messageRoomService: MessageRoomService,
    private messageContentService: MessageContentService,
    private messageRoomMemberService: MessageRoomMemberService,
    private themeService: ThemeService
  ) {}


  async ngOnInit() {
    this.currentUser = this.userService.getFromLocalStorage();
    if(!this.currentUser || !this.currentUser.firstname) {
      this.router.navigate(['/login']);
      return;
    }

    window.addEventListener('beforeunload', () => {
      this.userService.disconnect(this.currentUser);
      this.messageContentService.disconnect();
      if(this.selectedRoom) {
        this.updateLastSeen(true);
      }
    });

    this.userService.connect(this.currentUser);
    this.messageContentService.connect(this.currentUser.firstname);
  }


  ngOnDestroy() {
    if(!this.currentUser || !this.currentUser.firstname) return;
    this.userService.disconnect(this.currentUser);
    this.messageContentService.disconnect();
  }


  logout() {
    this.userService.disconnect(this.currentUser);
    this.messageContentService.disconnect();
    this.userService.removeLocalStorage();
    this.router.navigate(['/login']);
  }


  chat(members: User[]) {
    if(members.length === 0) return;
    this.findOrCreateChatRoom(members);
  }


  findOrCreateChatRoom(members: User[]) {
    if(!this.currentUser.firstname) return;
    const firstnames = members.map((user: User) => user.firstname)
                                        .filter((firstname): firstname is string => firstname !== undefined)
                                        .filter((firstname: string) => firstname !== this.currentUser.firstname);
    firstnames.push(this.currentUser.firstname);

    this.messageRoomService.findMessageRoomByMembers(firstnames).subscribe({
      next: (chatRoom: MessageRoom) => {
        if(!chatRoom) {
          this.messageRoomService.createMessageRoom(this.currentUser.firstname as string, firstnames).subscribe({
            next: (room: MessageRoom) => {
              if(room.isGroup) {
                this.messageContentService.sendMessage({
                  sender: {firstname: this.currentUser.firstname},
                  messageRoomId: room.id,
                  messageType: MessageType.NOTIFICATION_CREATE_ROOM
                });
              }
              this.selectRoom(room);
              this.visible = false;
              members = [];
            },
            error: (error: any) => {
              console.error(error);
            }
          });
        }
        else {
          this.selectRoom(chatRoom);
          this.visible = false;
          members = [];
        }
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  sendMessage() {
    if(!this.message.content || !this.selectedRoom) return;

    this.message = {
      ...this.message,
      content: this.message.content.trim(),
      sender: {firstname: this.currentUser.firstname},
      messageRoomId: this.selectedRoom.id,
      messageType: MessageType.TEXT
    }

    this.messageContentService.sendMessage(this.message);

    this.message = {} as MessageContent;
  }


  selectRoom(room: MessageRoom) {
    this.updateLastSeen(true);
    this.selectedRoom = room;
    console.log(this.selectedRoom);
    this.getRoomMembers();
    this.getMessagesByRoomId();
    this.updateLastSeen(false);
  }


  getRoomMembers() {
    if(!this.selectedRoom) return;
    this.messageRoomMemberService.getRoomMembers(this.selectedRoom.id).subscribe({
      next: (members: any) => {
        this.selectedRoom.members = members;
        let firstnames = members.map((member: any) => member.firstname);
        if (!this.selectedRoom.isGroup) {
          firstnames = members.map((member: any) => member.firstname)
                             .filter((firstname: string) => firstname !== this.currentUser.firstname);
        }
        this.currentMemberLastSeen = members.find((member: any) => member.firstname === this.currentUser.firstname)?.lastSeen || '';
        this.currentMember = this.selectedRoom?.members?.find((member: any) => member.firstname === this.currentUser.firstname) || {} as MessageRoomMember;
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  getMessagesByRoomId() {
    if(!this.selectedRoom) return;
    this.messageContentService.getMessagesByRoomId(this.selectedRoom.id).subscribe({
      next: (messages: any) => {
        this.selectedRoom.messages = messages;
        document.getElementById('message-input')?.focus();
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  updateLastSeen(isUpdateIndex: boolean) {
    if(!this.selectedRoom || !this.selectedRoom.id || !this.currentUser.firstname) return;
    this.messageRoomMemberService.updateLastSeen(this.selectedRoom.id, this.currentUser.firstname).subscribe({
      next: (member: MessageRoomMember) => {
        if(isUpdateIndex) this.currentMemberLastSeen = member.lastSeen || '';
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  getMemberNotMe(members?: MessageRoomMember[]): MessageRoomMember {
    if(!members) return {} as MessageRoomMember;
    return members.find((member: MessageRoomMember) => member.firstname !== this.currentUser.firstname) || {} as MessageRoomMember;
  }


  addMembers(members: User[]) {
    if(!this.selectedRoom || !this.selectedRoom.id || members.length === 0) return;
    this.messageRoomMemberService.addMembers(this.selectedRoom.id, members).subscribe({
      next: (members: any) => {
        this.selectedRoom.members = [...(this.selectedRoom.members ?? []), ...members];
        this.addMembersVisible = false;
        this.messageContentService.sendMessage({
          sender: {firstname: this.currentUser.firstname},
          messageRoomId: this.selectedRoom.id,
          content: members.map((member: any) => member.firstname).join(', '),
          messageType: MessageType.NOTIFICATION_ADD_MEMBER
        });
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  makeAdmin(member: MessageRoomMember) {
    if(!this.selectedRoom || !this.selectedRoom.id || !member.firstname) return;
    this.messageRoomMemberService.makeAdmin(this.selectedRoom.id, member.firstname).subscribe({
      next: (member: MessageRoomMember) => {
        if(!this.selectedRoom.members) return;
        const index = this.selectedRoom.members.findIndex((m: MessageRoomMember) => m.firstname === member.firstname);
        if(index !== -1) {
          this.selectedRoom.members[index] = member;
        }
        this.editMemberVisible = false;

        this.messageContentService.sendMessage({
          sender: {firstname: this.currentUser.firstname},
          messageRoomId: this.selectedRoom.id,
          content: member.firstname,
          messageType: MessageType.NOTIFICATION_MAKE_ADMIN
        });
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  removeAdmin(member: MessageRoomMember) {
    if(!this.selectedRoom || !this.selectedRoom.id || !member.firstname) return;

    // make sure at least one admin exists
    const admins = this.selectedRoom.members?.filter((m: MessageRoomMember) => m.isAdmin);
    if(admins && admins.length === 1 && admins[0].firstname === member.firstname) {
      alert('At least one admin must exist');
      return;
    }

    this.messageRoomMemberService.removeAdmin(this.selectedRoom.id, member.firstname).subscribe({
      next: (member: MessageRoomMember) => {
        if(!this.selectedRoom.members) return;
        const index = this.selectedRoom.members.findIndex((m: MessageRoomMember) => m.firstname === member.firstname);
        if(index !== -1) {
          this.selectedRoom.members[index] = member;
        }
        // update current member if it is the same member
        if(this.currentMember.firstname === member.firstname) {
          this.currentMember = member;
        }
        this.editMemberVisible = false;

        this.messageContentService.sendMessage({
          sender: {firstname: this.currentUser.firstname},
          messageRoomId: this.selectedRoom.id,
          content: member.firstname,
          messageType: MessageType.NOTIFICATION_REMOVE_ADMIN
        });
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  removeMember(member: MessageRoomMember, isLeaveGroup?: boolean) {
    if(!this.selectedRoom || !this.selectedRoom.id || !member.firstname) return;

    // make sure at least one admin exists
    const admins = this.selectedRoom.members?.filter((m: MessageRoomMember) => m.isAdmin);
    if(admins && admins.length === 1 && admins[0].firstname === member.firstname) {
      alert('At least one admin must exist');
      return;
    }

    this.messageRoomMemberService.removeMember(this.selectedRoom.id, member.firstname).subscribe({
      next: () => {
        if(!this.selectedRoom.members) return;
        this.selectedRoom.members = this.selectedRoom.members.filter((m: MessageRoomMember) => m.firstname !== member.firstname);
        this.editMemberVisible = false;
        if(isLeaveGroup) {
          this.messageContentService.sendMessage({
            sender: {firstname: this.currentUser.firstname},
            messageRoomId: this.selectedRoom.id,
            content: member.firstname,
            messageType: MessageType.NOTIFICATION_LEAVE_ROOM
          });
          window.location.reload();
        }
        else {
          this.messageContentService.sendMessage({
            sender: {firstname: this.currentUser.firstname},
            messageRoomId: this.selectedRoom.id,
            content: member.firstname,
            messageType: MessageType.NOTIFICATION_REMOVE_MEMBER
          });
        }
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  leaveGroup() {
    this.removeMember(this.currentMember, true);
  }


  switchTheme(mode: 'light' | 'dark', color: string) {
    this.themeService.switchTheme(mode, color);
  }


  switchMode(mode: 'light' | 'dark') {
    this.themeService.switchMode(mode);
  }


  switchColor(color: string) {
    this.themeService.switchColor(color);
  }


  get themes() {
    return this.themeService.getThemes();
  }


  addEmoji(event: any) {
    // Add emoji to current caret position
const messageInput = document.getElementById('message-input') as HTMLTextAreaElement;
    if (!messageInput) return;
    messageInput.focus();
    const start = messageInput.selectionStart;
    const end = messageInput.selectionEnd;
    const value = messageInput.value;
    const emoji = event.emoji.native;
    if(start === null || end === null) return;
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    this.message.content = newValue;
  }


  updateGroupName() {
    if(!this.selectedRoom || !this.selectedRoom.id || !this.newGroupName) return;
    this.messageRoomService.updateGroupName(this.selectedRoom.id, this.newGroupName).subscribe({
      next: (room: MessageRoom) => {
        this.editGroupNameVisible = false;
        this.messageContentService.sendMessage({
          sender: {firstname: this.currentUser.firstname},
          messageRoomId: this.selectedRoom.id,
          content: this.newGroupName,
          messageType: MessageType.NOTIFICATION_CHANGE_NAME
        });
        this.newGroupName = '';
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

}
