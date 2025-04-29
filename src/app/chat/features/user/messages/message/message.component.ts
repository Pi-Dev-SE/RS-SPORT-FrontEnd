import { Component, Input } from '@angular/core';
import { MessageContent, MessageType } from 'src/app/chat/core/interfaces/message-content';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent {
  @Input() isOwner: boolean = false;
  @Input() message!: MessageContent;
  @Input() isGroup?: boolean;

  MessageType = MessageType;
}
