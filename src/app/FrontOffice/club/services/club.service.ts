import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private apiUrl = 'http://localhost:8088/spr01/api/clubs';
  private currentClub: Club | null = null;

  constructor(private http: HttpClient) { }

  setCurrentClub(club: Club): void {
    this.currentClub = club;
  }

  getCurrentClub(): Club | null {
    return this.currentClub;
  }

  clearCurrentClub(): void {
    this.currentClub = null;
  }

  getAllClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.apiUrl}/GetAll`);
  }

  getClubsByName(name: string): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.apiUrl}/getclubs/name/${name}`);
  }

  getClubById(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.apiUrl}/${id}`);
  }

  addClub(formData: FormData): Observable<Club> {
    return this.http.post<Club>(`${this.apiUrl}/add-club`, formData);
  }

  updateClub(clubId: number, formData: FormData): Observable<Club> {
    // Add clubId to the formData if not already added
    if (!formData.has('clubId')) {
      formData.append('clubId', clubId.toString());
    }
    return this.http.put<Club>(`${this.apiUrl}/update-club/${clubId}`, formData);
  }

  deleteClub(clubId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteclub/${clubId}`);
  }

  assignPlayerToClub(clubId: number, playerId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/assignplytoclub/${clubId}/${playerId}`, {});
  }

  assignCoachToClub(clubId: number, coachId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/assigncoachtoclub/${clubId}/${coachId}`, {});
  }

  removePlayerFromClub(clubId: number, playerId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/removeplayertoclub/${clubId}/${playerId}`, {});
  }

  removeCoachFromClub(clubId: number, coachId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/removecoachtoclub/${clubId}/${coachId}`, {});
  }

  updatePlayerClub(playerId: number, newClubId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/updateplayerclub/${playerId}/${newClubId}`, {});
  }

  updateCoachClub(coachId: number, newClubId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/updatecoachclub/${coachId}/${newClubId}`, {});
  }
}
