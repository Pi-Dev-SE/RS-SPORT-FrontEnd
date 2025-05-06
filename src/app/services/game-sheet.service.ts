import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GameSheet, GameSheetResponse } from '../Models/GameSheet';

@Injectable({
  providedIn: 'root'
})
export class GameSheetService {
  private baseUrl = 'http://localhost:8088/spr01/GameSheet';

  constructor(private http: HttpClient) { }

  getAllGameSheets(): Observable<GameSheet[]> {
    return this.http.get<{ gameSheets: GameSheet[] }>(`${this.baseUrl}/all`)
      .pipe(
        map(response => response.gameSheets || [])
      );
  }

  getGameSheetById(id: number): Observable<GameSheet> {
    return this.http.get<{ gameSheet: GameSheet }>(`${this.baseUrl}/getgamecard/${id}`)
      .pipe(
        map(response => response.gameSheet)
      );
  }

  getGameSheetByGameId(gameId: number): Observable<GameSheet> {
    return this.http.get<GameSheet>(`${this.baseUrl}/by-game/${gameId}`);
  }

  // New method to get game sheet details with player information
  getGameSheetDetailsByGameId(gameId: number): Observable<GameSheetResponse[]> {
    return this.http.get<GameSheetResponse[]>(`${this.baseUrl}/by-game/${gameId}`);
  }

  addGameSheet(homeTeamId: number, awayTeamId: number, gameSheet: GameSheet): Observable<GameSheet> {
    // Add the team IDs as query parameters
    return this.http.post<GameSheet>(
      `${this.baseUrl}/add?homeTeamId=${homeTeamId}&awayTeamId=${awayTeamId}`, 
      gameSheet
    );
  }

  updateGameSheet(id: number, gameSheet: GameSheet): Observable<GameSheet> {
    return this.http.put<GameSheet>(`${this.baseUrl}/upgamecard/updategameSheet/${id}`, gameSheet);
  }

  deleteGameSheet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  // Additional methods that might be useful

  // Get game sheets for a specific team
  getGameSheetsByTeamId(teamId: number): Observable<GameSheet[]> {
    return this.http.get<GameSheet[]>(`${this.baseUrl}/team/${teamId}`);
  }

  // Get latest game sheets (most recent matches)
  getLatestGameSheets(count: number = 5): Observable<GameSheet[]> {
    return this.http.get<GameSheet[]>(`${this.baseUrl}/latest?count=${count}`);
  }
}