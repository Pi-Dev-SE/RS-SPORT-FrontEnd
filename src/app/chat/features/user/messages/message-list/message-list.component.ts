import { Component, Input } from '@angular/core';
import { MessageContent } from 'src/app/chat/core/interfaces/message-content';
import { MessageRoom } from 'src/app/chat/core/interfaces/message-room';
import { User } from 'src/app/chat/core/interfaces/user-chat';
import { MessageContentService } from 'src/app/chat/core/services/message-content.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})

export class MessageListComponent {
  @Input() messages: MessageContent[] = [];
  @Input() currentUser!: User;
  @Input() selectedRoom!: MessageRoom;
  @Input() lastSeen!: string;

  messageContentSubscription: any;
  unseenMessageIndex: number | null = null;

  constructor(
    private messageContentService: MessageContentService
  ) { }


  ngOnInit() {
    this.updateUnseenMessageIndex();
    this.subscribeMessageContent();
    setTimeout(() => {
      this.scrollToBottom();
    }, 200);
  }


  ngOnChanges(changes: any) {
    if(changes.messages && changes.messages.currentValue) {
      this.updateUnseenMessageIndex();
      setTimeout(() => {
        this.scrollToBottom();
      }, 200);
    }
  }


  ngOnDestroy() {
    if(this.messageContentSubscription) {
      this.messageContentSubscription.unsubscribe();
    }
  }


  updateUnseenMessageIndex() {
    this.unseenMessageIndex = this.messages.findIndex(
      (message => new Date(message.dateSent || '') > new Date(this.lastSeen)
      && message.sender?.firstname !== this.currentUser.firstname)
    );
  }


  subscribeMessageContent() {
    this.messageContentSubscription = this.messageContentService.subscribeMessageContent().subscribe({
      next: (messageContent: MessageContent) => {
        if(messageContent.messageRoomId === this.selectedRoom.id) {
          this.messages.push(messageContent);
          // Scroll to the bottom of the chat
          setTimeout(() => {
            this.scrollToBottom();
          }, 200); // 200ms delay is from the CSS transition
        }
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }


  scrollToBottom() {
    // Scroll to the bottom of the chat
    const chat = document.getElementById('chat-area');
    if(chat) chat.scrollTop = chat.scrollHeight;
  }


  scrollToUnseen() {
    // Scroll to the first unseen message
    const unseenMessage = document.getElementById('unseen-breakpoint');
    if(unseenMessage) unseenMessage.scrollIntoView({ behavior: 'smooth' });
  }

}
