import { Component, Input } from '@angular/core';
import { User } from 'src/app/chat/core/interfaces/user-chat';
import { UserService } from 'src/app/chat/core/services/user.service';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})

export class AvatarComponent {
  @Input() firstname?: string;
  @Input() width: string = '32px';
  @Input() height!: string;
  @Input() isOnline?: boolean;
  @Input() uploadAvatar?: boolean;
  @Input() avatarUrl?: string;

  constructor(
    public userService: UserService
  ) { }


  ngOnInit() {
    if (!this.height) {
      this.height = this.width;
    }

    if(!this.avatarUrl) {
      this.avatarUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNL_ZnOTpXSvhf1UaK7beHey2BX42U6solRA&s';
    }

    // S'assurer que firstname n'est pas undefined ou vide
    if (!this.firstname || this.firstname.trim() === '') {
      // Récupérer l'utilisateur actuel du localStorage pour essayer d'obtenir un prénom
      const userData = localStorage.getItem('user_data') ?? localStorage.getItem('user') ?? '{}';
      const parsedUser = JSON.parse(userData);

      if (parsedUser.firstname) {
        this.firstname = parsedUser.firstname;
      } else if (parsedUser.email) {
        this.firstname = parsedUser.email.split('@')[0];
      } else {
        console.warn('Avatar: firstname est vide ou undefined');
        this.firstname = 'User';
      }
    }
  }


  upload() {
    if(!this.uploadAvatar || this.firstname !== this.userService.getFromLocalStorage().firstname) {
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = () => {
      const file = input.files?.item(0);

      if(!file) {
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('firstname', this.firstname ?? '');

      this.userService.uploadAvatar(formData).subscribe({
        next: (response: User) => {
          this.userService.saveToLocalStorage(response);
        },
        error: (error: any) => {
          console.error(error);
        }
      });

      this.avatarUrl = URL.createObjectURL(file);

    }
  }

}
