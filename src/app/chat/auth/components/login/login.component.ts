import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/chat/core/interfaces/user-chat';
import { UserService } from 'src/app/chat/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  user: User = {
    firstname: '',
    password: ''
  };

  constructor(
    private userService: UserService,
    private router: Router
  ) {}


  login() {
    if(!this.user.firstname || !this.user.password) {
      return;
    }

    this.user.firstname = this.user.firstname.trim();
    this.user.password = this.user.password.trim();

    this.userService.login(this.user).subscribe({
      next: (response: User) => {
        console.log(response);
        this.userService.saveToLocalStorage(response);
        this.router.navigate(['/chat']);
      },
      error: (error: any) => {
        console.error(error);
      }
    })
  }

}
