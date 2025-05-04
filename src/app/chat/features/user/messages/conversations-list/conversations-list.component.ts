import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageContent } from 'src/app/chat/core/interfaces/message-content';
import { MessageRoom } from 'src/app/chat/core/interfaces/message-room';
import { User } from 'src/app/chat/core/interfaces/user-chat';
import { MessageContentService } from 'src/app/chat/core/services/message-content.service';
import { MessageRoomService } from 'src/app/chat/core/services/message-room.service';

@Component({
  selector: 'app-conversations-list',
  templateUrl: './conversations-list.component.html',
  styleUrls: ['./conversations-list.component.scss']
})

export class ConversationsListComponent {
  @Input() currentUser!: User;
  @Output() selectRoomEvent = new EventEmitter<MessageRoom>();

  messageRooms: MessageRoom[] = [];
  selectedRoomId: string = '';

  messageContentSubscription: any;

  constructor(
    private messageRoomService: MessageRoomService,
    private messageContentService: MessageContentService
  ) {}


  ngOnInit() {
    if(!this.currentUser || !this.currentUser.firstname) return;
    this.findMessageRoomsByMember(this.currentUser.firstname);
    this.subscribeMessageContent();
  }


  ngOnDestroy() {
    if(this.messageContentSubscription) {
      this.messageContentSubscription.unsubscribe();
    }
  }


  findMessageRoomsByMember(firstname: string) {
    this.messageRoomService.findMessageRoomsByMember(firstname).subscribe({
      next: (messageRooms: any) => {
        this.messageRooms = messageRooms;
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  selectRoom(room: MessageRoom) {
    if(room.id === this.selectedRoomId) return;
    this.selectRoomEvent.emit(room);
    this.selectedRoomId = room.id || '';
  }


  subscribeMessageContent() {
    this.messageContentSubscription = this.messageContentService.subscribeMessageContent().subscribe({
      next: (messageContent: MessageContent) => {
        if(Object.keys(messageContent).length === 0) return;
        this.onReceiveMessage(messageContent);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  onReceiveMessage(messageContent: MessageContent) {
    if(!messageContent.dateSent) {
      messageContent.dateSent = new Date().toISOString();
    }

    // S'assurer que l'expéditeur du message a un prénom valide
    if (messageContent.sender) {
      if (!messageContent.sender.firstname && messageContent.sender.email) {
        messageContent.sender.firstname = messageContent.sender.email.split('@')[0];
      } else if (!messageContent.sender.firstname) {
        messageContent.sender.firstname = 'Utilisateur';
      }
    } else {
      messageContent.sender = { firstname: 'Utilisateur' };
    }

    const index = this.messageRooms.findIndex((room: MessageRoom) => room.id === messageContent.messageRoomId);
    if(index !== -1) {
      let room = this.messageRooms[index];
      if(messageContent.sender?.firstname !== this.currentUser.firstname
        && messageContent.messageRoomId !== this.selectedRoomId
      ) {
        // update unSeenCount
        this.messageRooms[index] = {
          ...room,
          unSeenCount: room.unSeenCount ? room.unSeenCount + 1 : 1
        }
      }
      // update lastMessage
      this.messageRooms[index].lastMessage = messageContent;
      this.messageRooms = [...this.messageRooms];

      // move the room to the top
      const [selectedRoom] = this.messageRooms.splice(index, 1);
      this.messageRooms.unshift(selectedRoom);
    }
    else {
      this.messageRoomService.findById(this.currentUser.firstname, messageContent.messageRoomId).subscribe({
        next: (messageRoom: MessageRoom) => {
          messageRoom.lastMessage = messageContent;
          messageRoom.unSeenCount = 1;
          this.messageRooms.unshift(messageRoom);
        },
        error: (error: any) => {
          console.error(error);
        }
      });
    }
  }

}
