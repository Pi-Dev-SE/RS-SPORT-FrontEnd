import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-header-front',
  templateUrl: './header-front.component.html',
  styleUrls: ['./header-front.component.css']
})
export class HeaderFrontComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<any>;
  isAdmin$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser$ = this.authService.currentUser$;
    this.isAdmin$ = this.currentUser$.pipe(
      map(user => user && user.userRole === 'ADMIN')
    );
  }

  ngOnInit(): void {
  }
}
