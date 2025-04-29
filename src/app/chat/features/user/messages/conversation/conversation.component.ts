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


  selectRoom() {
    this.selectRoomEvent.emit(this.messageRoom);
    this.isSelected = true;
    this.messageRoom.unSeenCount = 0;
  }

}
