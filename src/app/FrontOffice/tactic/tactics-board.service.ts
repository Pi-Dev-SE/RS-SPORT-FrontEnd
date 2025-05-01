import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, of } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { TacticsBoard } from '../../core/models/TacticsBoard';
import { map } from 'rxjs/operators';

export interface TacticsEngagementData {
  modifiedBoards: number;
  unchangedBoards: number;
}

export interface TacticsMonthlyActivity {
  month: string;
  count: number;
}

export interface TacticsPlayerCount {
  boardName: string;
  playerCount: number;
}

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

  getTacticsBoards(page: number, size: number, search: string = '', sort: string = 'desc'): Observable<{
    data: TacticsBoard[],
    currentPage: number,
    totalPages: number,
    totalItems: number
  }> {
    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString())
    .set('search', search)
    .set('sort', sort);
    return this.http.get<{
      data: TacticsBoard[],
      currentPage: number,
      totalPages: number,
      totalItems: number
    }>(`${this.apiUrl}/getAllBoards`, { params }).pipe(
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
      catchError((error: HttpErrorResponse) => {
        if (error.error && typeof error.error === 'object') {
          if (error.error.message && error.error.message.includes('name already exists')) {
            return throwError(() => new Error('Ce nom de tableau tactique existe déjà. Veuillez choisir un nom unique.'));
          }
        }
        return this.handleError(error);
      })
    );
  }

  updateTacticsBoard(id: number, board: TacticsBoard): Observable<TacticsBoard> {
    return this.http.put<TacticsBoard>(`${this.apiUrl}/updateBoard/${id}`, board).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error && typeof error.error === 'object') {
          if (error.error.message && error.error.message.includes('name already exists')) {
            return throwError(() => new Error('Ce nom de tableau tactique existe déjà. Veuillez choisir un nom unique.'));
          }
        }
        return this.handleError(error);
      })
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

  // Méthodes pour les statistiques

  // Récupère les données d'engagement (tableaux modifiés vs non modifiés)
  getEngagementData(): Observable<TacticsEngagementData> {
    return this.http.get<TacticsEngagementData>(`${this.apiUrl}/stats/engagement`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des données d\'engagement:', error);
        // Données fictives en cas d'erreur
        return of({ modifiedBoards: 12, unchangedBoards: 5 });
      })
    );
  }

  // Récupère les données d'activité mensuelle
  getMonthlyActivityData(): Observable<TacticsMonthlyActivity[]> {
    return this.http.get<TacticsMonthlyActivity[]>(`${this.apiUrl}/stats/monthly-activity`).pipe(
      map(data => {
        // Vérification et traitement des données reçues
        if (!data || data.length === 0) {
          console.warn('Aucune donnée d\'activité mensuelle reçue du serveur');
          // Retourner un tableau vide au lieu de données fictives
          return [];
        }
        // Trier les données par ordre chronologique
        return data.sort((a, b) => {
          // Utiliser les noms de mois complets en français
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December',
            // Ajouter aussi les noms en français pour plus de robustesse
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
          ];
          return months.indexOf(a.month) - months.indexOf(b.month);
        });
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des données d\'activité mensuelle:', error);
        // Retourner un tableau vide au lieu de données fictives
        return of([]);
      })
    );
  }

  // Récupère le nombre de joueurs par tableau tactique
  getPlayerCountByBoard(): Observable<TacticsPlayerCount[]> {
    return this.http.get<TacticsPlayerCount[]>(`${this.apiUrl}/stats/player-count`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du nombre de joueurs par tableau:', error);
        // Données fictives en cas d'erreur
        return of([
          { boardName: 'Formation 4-4-2', playerCount: 11 },
          { boardName: 'Formation 4-3-3', playerCount: 10 },
          { boardName: 'Formation 3-5-2', playerCount: 10 },
          { boardName: 'Formation 5-3-2', playerCount: 10 },
          { boardName: 'Tactique défensive', playerCount: 11 }
        ]);
      })
    );
  }

  addPlayer(player: PlayerIcon, tacticsBoardId: number): Observable<PlayerIcon> {
    // Validation côté frontend pour le numéro de maillot
    if (player.jerseyNumber < 1) {
      return throwError(() => new Error('Le numéro de maillot doit être supérieur ou égal à 1.'));
    }

    return this.http.post<PlayerIcon>(`${this.apiUrl}/players/add/${tacticsBoardId}`, player).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error && typeof error.error === 'object') {
          if (error.error.message && error.error.message.includes('jersey number')) {
            return throwError(() => new Error('Le numéro de maillot doit être supérieur ou égal à 1.'));
          }
        }
        return this.handleError(error);
      })
    );
  }


  updatePlayer(player: PlayerIcon, tacticsBoardId: number): Observable<PlayerIcon> {
    // Validation côté frontend pour le numéro de maillot
    if (player.jerseyNumber < 1) {
      return throwError(() => new Error('Le numéro de maillot doit être supérieur ou égal à 1.'));
    }

    const formattedPlayer = {
      id: player.id,
      jerseyNumber: player.jerseyNumber,
      jerseyColor: player.jerseyColor,
      positionX: player.position.x,
      positionY: player.position.y,
    };
    return this.http.put<PlayerIcon>(`${this.apiUrl}/players/update/${tacticsBoardId}`, formattedPlayer).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error && typeof error.error === 'object') {
          if (error.error.message && error.error.message.includes('jersey number')) {
            return throwError(() => new Error('Le numéro de maillot doit être supérieur ou égal à 1.'));
          }
        }
        return this.handleError(error);
      })
    );
  }
  deletePlayer(jerseyNumber: number, tacticsBoardId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/players/delete/${tacticsBoardId}/${jerseyNumber}`).pipe(
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
