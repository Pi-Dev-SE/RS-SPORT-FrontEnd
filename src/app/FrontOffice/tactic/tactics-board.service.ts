import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TacticsBoard } from '../../core/models/TacticsBoard';
import { map } from 'rxjs/operators';

export interface Position {
  x: number;
  y: number;
}

export interface PlayerIcon {
  id: number;
  jerseyNumber: number;
  jerseyColor: string;
  position: Position;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TacticsBoardService {
  apiUrl = 'http://localhost:8088/spr01/tacticsBoards';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(`Error status: ${error.status}, Message: ${error.message}`);
    return throwError(() => new Error('An error occurred while processing the request.'));
  }

  getTacticsBoards(): Observable<TacticsBoard[]> {
    return this.http.get<TacticsBoard[]>(`${this.apiUrl}/getAllBoards`).pipe(
      catchError(this.handleError)
    );
  }

  getTacticsBoard(id: number): Observable<TacticsBoard> {
    return this.http.get<TacticsBoard>(`${this.apiUrl}/getBoard/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createTacticsBoard(board: TacticsBoard): Observable<TacticsBoard> {
    return this.http.post<TacticsBoard>(`${this.apiUrl}/addBoard`, board).pipe(
      catchError(this.handleError)
    );
  }

  updateTacticsBoard(id: number, board: TacticsBoard): Observable<TacticsBoard> {
    return this.http.put<TacticsBoard>(`${this.apiUrl}/updateBoard/${id}`, board).pipe(
      catchError(this.handleError)
    );
  }

  deleteTacticsBoard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteBoard/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAvailablePlayers(): Observable<PlayerIcon[]> {
    return this.http.get<PlayerIcon[]>(`${this.apiUrl}/playersall`).pipe(
      catchError(this.handleError)
    );
  }

  getPlayersByTacticsBoard(tacticsBoardId: number): Observable<PlayerIcon[]> {
    return this.http.get<PlayerIcon[]>(`${this.apiUrl}/players/board/${tacticsBoardId}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  addPlayer(player: PlayerIcon, tacticsBoardId: number): Observable<PlayerIcon> {
    return this.http.post<PlayerIcon>(`${this.apiUrl}/players/add/${tacticsBoardId}`, player).pipe(
      catchError(this.handleError)
    );
  }


  updatePlayer(player: PlayerIcon, tacticsBoardId: number): Observable<PlayerIcon> {
    const formattedPlayer = {
      id: player.id,
      jerseyNumber: player.jerseyNumber,
      jerseyColor: player.jerseyColor,
      positionX: player.position.x,
      positionY: player.position.y,
      role: player.role
    };
    return this.http.put<PlayerIcon>(`${this.apiUrl}/players/update/${tacticsBoardId}`, formattedPlayer).pipe(
      catchError(this.handleError)
    );
  }
  deletePlayer(playerId: number, tacticsBoardId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/players/delete/${tacticsBoardId}/${playerId}`).pipe(
      catchError(error => {
        console.error('Error deleting player:', error);
        if (error.status === 404) {
          return throwError(() => new Error('Player or tactics board not found'));
        }
        return throwError(() => new Error('Failed to delete player. Please try again later.'));
      })
    );
  }

}
