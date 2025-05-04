import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/chat/core/interfaces/user-chat';
import { UserService } from 'src/app/chat/core/services/user.service';

@Component({
  selector: 'app-select-member-dialog',
  templateUrl: './select-member-dialog.component.html',
  styleUrls: ['./select-member-dialog.component.scss']
})

export class SelectMemberDialogComponent {
  @Input() visible: boolean = false;
  @Input() searchedUsers: User[] = [];
  @Input() excludeUsers?: User[] = [];
  @Input() title: string = '';
  @Input() submitButtonText: string = '';

  @Output() onHideEvent = new EventEmitter();
  @Output() onSubmitEvent = new EventEmitter();

  selectedUsers: User[] = [];

  constructor(
    private userService: UserService
  ) { }


  onSubmit() {
    this.onSubmitEvent.emit(this.selectedUsers);
    this.selectedUsers = [];
  }


  onHide() {
    this.onHideEvent.emit();
  }


  handleKeyUp(event: any) {
    this.userService.searchUsers(event.originalEvent.data, this.excludeUsers).subscribe({
      next: (users) => {
        console.log(users);

        // Vérifier et corriger les utilisateurs sans prénom
        this.searchedUsers = users.map(user => {
          if (!user.firstname && user.email) {
            return { ...user, firstname: user.email.split('@')[0] };
          } else if (!user.firstname) {
            return { ...user, firstname: 'Utilisateur' };
          }
          return user;
        });
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  handleSearch(event: { query: string }) {
    const firstname = event.query.trim();
    // on passe toujours un array (évite POST sans corps)
    const exclusions = this.excludeUsers ?? [];

    if (firstname.length === 0) {
      this.searchedUsers = [];
      return;
    }

    this.userService.searchUsers(firstname, exclusions).subscribe({
      next: users => {
        console.log('search results:', users);
        // Vérifier et corriger les utilisateurs sans prénom
        this.searchedUsers = users.map(user => {
          if (!user.firstname && user.email) {
            return { ...user, firstname: user.email.split('@')[0] };
          } else if (!user.firstname) {
            return { ...user, firstname: 'Utilisateur' };
          }
          return user;
        });
      },
      error: err => console.error(err)
    });
  }

}
