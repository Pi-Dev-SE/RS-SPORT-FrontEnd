import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessagesRoutingModule } from './messages-routing.module';
import { MessagesComponent } from './messages.component';
import { PrimengModule } from 'src/app/chat/primeng/primeng.module';
import { FormsModule } from '@angular/forms';
import { ActiveUsersListComponent } from './active-users-list/active-users-list.component';
import { SharedModule } from '../../shared/shared.module';
import { ConversationsListComponent } from './conversations-list/conversations-list.component';
import { ConversationComponent } from './conversation/conversation.component';
import { MessageListComponent } from './message-list/message-list.component';
import { MessageComponent } from './message/message.component';
import { SelectMemberDialogComponent } from './select-member-dialog/select-member-dialog.component';
import { CoreModule } from 'src/app/chat/core/core.module';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';


@NgModule({
  declarations: [
    MessagesComponent,
    ActiveUsersListComponent,
    ConversationsListComponent,
    ConversationComponent,
    MessageListComponent,
    MessageComponent,
    SelectMemberDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MessagesRoutingModule,
    PrimengModule,
    SharedModule,
    CoreModule,
    PickerComponent
  ]
})
export class MessagesModule { }
