import { Component, Input } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { User } from 'src/app/chat/core/interfaces/user-chat';
import { UserService } from 'src/app/chat/core/services/user.service';

@Component({
  selector: 'app-active-users-list',
  templateUrl: './active-users-list.component.html',
  styleUrls: ['./active-users-list.component.scss']
})

export class ActiveUsersListComponent {
  @Input() currentUser: User = {} as User;

  activeUsers: User[] = [];
  activeUsersSubscription: any;

  constructor(
    private userService: UserService
  ) {}


  async ngOnInit() {
    this.activeUsers = await lastValueFrom(this.userService.getOnlineUsers());
    this.subscribeActiveUsers();
  }


  ngOnDestroy() {
    if(this.activeUsersSubscription) {
      this.activeUsersSubscription.unsubscribe();
    }
  }


  subscribeActiveUsers() {
    this.activeUsersSubscription = this.userService.subscribeActiveUsers().subscribe({
      next: (user: User) => {
        if(Object.keys(user).length === 0) return;
        if(user.status === 'OFFLINE') {
          this.activeUsers = this.activeUsers.filter((u: User) => u.firstname !== user.firstname);
        }
        else if (!this.activeUsers.some(existingUser => existingUser.firstname === user.firstname)) {
          this.activeUsers = [...this.activeUsers, user];
        }
      }
    });
  }

}
