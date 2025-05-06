import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game, GameDto, GameStatus } from '../Models/Game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = 'http://localhost:8088/spr01/game';
  private predictionUrl = 'http://localhost:8088/spr01/api/prediction';

  constructor(private http: HttpClient) { }

  getAllGames(): Observable<GameDto[]> {
    return this.http.get<GameDto[]>(`${this.baseUrl}/all`);
  }

  getGameById(id: number): Observable<GameDto> {
    return this.http.get<GameDto>(`${this.baseUrl}/${id}`);
  }

  addGame(game: Game, homeTeamId: number, awayTeamId: number): Observable<Game> {
    return this.http.post<Game>(`${this.baseUrl}/add/${homeTeamId}/${awayTeamId}`, game);
  }

  updateGame(id: number, game: Game): Observable<Game> {
    return this.http.put<Game>(`${this.baseUrl}/update/${id}`, game);
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  // Update a specific game's status
  updateGameStatus(id: number, status: GameStatus): Observable<GameDto> {
    return this.http.put<GameDto>(`${this.baseUrl}/updateStatus/${id}`, { status });
  }

  // Automatically update all game statuses (e.g., scheduled matches that should be live)
  updateAllGameStatuses(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/updateAllStatuses`, {});
  }

  // Get games for a specific team
  getGamesByTeamId(teamId: number): Observable<GameDto[]> {
    return this.http.get<GameDto[]>(`${this.baseUrl}/team/${teamId}`);
  }

  // Optional: Get upcoming games (scheduled games in the future)
  getUpcomingGames(): Observable<GameDto[]> {
    return this.http.get<GameDto[]>(`${this.baseUrl}/upcoming`);
  }

  // Optional: Get live games
  getLiveGames(): Observable<GameDto[]> {
    return this.http.get<GameDto[]>(`${this.baseUrl}/live`);
  }

  // Optional: Get recent/past games
  getPastGames(): Observable<GameDto[]> {
    return this.http.get<GameDto[]>(`${this.baseUrl}/past`);
  }

  // Get prediction for a match between two teams
  getPrediction(homeTeamId: number, awayTeamId: number): Observable<any> {
    return this.http.get<any>(`${this.predictionUrl}/match`, {
      params: new HttpParams()
        .set('homeTeamId', homeTeamId.toString())
        .set('awayTeamId', awayTeamId.toString())
    });
  }
}