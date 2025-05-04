import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageType } from 'src/app/chat/core/interfaces/message-content';
import { MessageRoom } from 'src/app/chat/core/interfaces/message-room';
import { User } from 'src/app/chat/core/interfaces/user-chat';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})

export class ConversationComponent {
  @Input() messageRoom!: MessageRoom;
  @Input() currentUser!: User;
  @Input() isSelected: boolean = false;

  @Output() selectRoomEvent = new EventEmitter<MessageRoom>();

  otherAvatarUrl!: string;
  MessageType = MessageType;

  ngOnInit() {
    // S'assurer que le nom de la conversation est défini
    if (!this.messageRoom.name || this.messageRoom.name.trim() === '') {
      console.warn('Conversation: nom de la conversation manquant');
      if (this.messageRoom.isGroup) {
        this.messageRoom.name = 'Groupe';
      } else {
        this.messageRoom.name = 'Discussion';
      }
    }
  }

  selectRoom() {
    this.selectRoomEvent.emit(this.messageRoom);
    this.isSelected = true;
    this.messageRoom.unSeenCount = 0;
  }

}
