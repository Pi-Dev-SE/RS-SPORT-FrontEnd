import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { Session } from '../../models/session.model';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
})
export class SessionListComponent implements OnInit {
  sessions: Session[] = [];

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.getAllSessions().subscribe({
      next: (data) => {
        this.sessions = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sessions', err);
      },
    });
  }


  deleteSession(id: number): void {
    this.sessionService.deleteSession(id).subscribe({
      next: (data) => {
        this.sessions = data; 
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
      },
    });
  }
}
