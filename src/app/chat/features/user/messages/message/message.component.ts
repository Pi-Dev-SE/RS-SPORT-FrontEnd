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

  ngOnInit() {
    // S'assurer que le prénom de l'expéditeur est défini
    if (!this.message.sender || !this.message.sender.firstname) {
      console.warn('Message: prénom de l\'expéditeur manquant');
      if (!this.message.sender) {
        this.message.sender = { firstname: 'Utilisateur' };
      } else if (this.message.sender.email) {
        // Utiliser l'email comme alternative pour le prénom
        this.message.sender.firstname = this.message.sender.email.split('@')[0];
      } else {
        this.message.sender.firstname = 'Utilisateur';
      }
    }
  }
}
