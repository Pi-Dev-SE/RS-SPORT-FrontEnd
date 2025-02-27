import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../models/session.model';
import { Exercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private baseUrl = 'http://localhost:8089/api/sessions'; // URL de l'API backend

  constructor(private http: HttpClient) {}

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/GetAll`);
  }

  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/getById/${id}`);
  }

  createSession(session: Session): Observable<Session> {
    return this.http.post<Session>(`${this.baseUrl}/create`, session);
  }

  deleteSession(id: number): Observable<Session[]> {
    return this.http.delete<Session[]>(`${this.baseUrl}/deleteById/${id}`);
  }

  addExercisesToSession(sessionId: number, exercises: Exercise[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/addExercicesToSession/${sessionId}/exercises`, exercises);
  }

  updateSession(sessionId: number, session: Session): Observable<Session> {
    return this.http.put<Session>(`${this.baseUrl}/Update/${sessionId}`, session);
  }
}
