import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlayerStatistics } from '../models/player-statistics.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerStatisticsService {
  private apiUrl = 'http://localhost:8088/spr01/api/player-statistics';

  constructor(private http: HttpClient) { }

  // Get all player statistics
  getAllPlayerStatistics(): Observable<PlayerStatistics[]> {
    return this.http.get<PlayerStatistics[]>(`${this.apiUrl}`);
  }

  // Get statistics for a specific player
  getPlayerStatistics(playerId: number): Observable<PlayerStatistics[]> {
    return this.http.get<PlayerStatistics[]>(`${this.apiUrl}/player/${playerId}`);
  }

  // Add statistics to a player
  addPlayerStatistics(playerId: number, statistics: PlayerStatistics): Observable<PlayerStatistics> {
    return this.http.post<PlayerStatistics>(`${this.apiUrl}/add/${playerId}`, statistics);
  }

  // Update player statistics
  updatePlayerStatistics(statId: number, statistics: PlayerStatistics): Observable<PlayerStatistics> {
    return this.http.put<PlayerStatistics>(`${this.apiUrl}/${statId}`, statistics);
  }

  // Delete player statistics
  deletePlayerStatistics(statId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${statId}`);
  }
}