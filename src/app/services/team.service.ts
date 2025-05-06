import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, interval } from 'rxjs';
import { catchError, retry, timeout, map, switchMap, startWith, tap } from 'rxjs/operators';
import { Team, TeamDto } from '../Models/Team';
import { CATEGORIE } from '../Models/categorie.enum';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private baseUrl = 'http://localhost:8088/spr01/api/teams';
  private timeout = 10000; // 10 seconds timeout
  private retries = 3; // Increased retry attempts
  private useMockData = false; // Flag to control mock data usage

  // Mock data for offline development - only used as a fallback
  private mockTeams: TeamDto[] = [
   
  ];

  constructor(private http: HttpClient) {
    // Check backend connection on service initialization and retry at intervals
    this.setupBackendConnectionChecking();
  }
  getAllTeams(): Observable<TeamDto[]> {
    return this.http.get<TeamDto[]>(this.baseUrl);
  }
  // Set up periodic backend connection checking
  private setupBackendConnectionChecking() {
    interval(15000) // Check more frequently - every 15 seconds
      .pipe(
        startWith(0), // Check immediately on startup
        switchMap(() => this.checkBackendConnection())
      )
      .subscribe({
        next: (isAvailable) => {
          this.useMockData = !isAvailable;
          if (isAvailable) {
            console.log('Backend connection established, using dynamic data from endpoints');
            // If connection is restored, refresh any cached data
          } else {
            console.warn('Backend unavailable, will retry connection and temporarily use mock data');
          }
        },
        error: () => {
          this.useMockData = true;
          console.warn('Error checking backend connection, will retry and temporarily use mock data');
        }
      });
  }

  // Refresh any cached data when connection is restored
  

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.status === 0) {
      // A client-side or network error occurred
      console.error('Network error or backend server not running:', error.error);
      errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
    } else {
      // The backend returned an unsuccessful response code
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
      errorMessage = `Error: ${error.status}. ${error.error?.message || 'Unknown error'}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // Add a new team to a club
  addTeam(team: Team, clubId: number): Observable<Team> {
    console.log('Attempting to add team using API endpoint');
    return this.http.post<Team>(`${this.baseUrl}/add/${clubId}`, team)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        tap(response => console.log('Successfully added team via API endpoint', response)),
        catchError((error) => {
          console.warn('Error in addTeam, attempting to reconnect to backend before fallback:', error);
          
          // Try to reconnect to backend before falling back
          return this.checkBackendConnection().pipe(
            switchMap(isAvailable => {
              if (isAvailable) {
                // If connection restored, retry the operation
                return this.http.post<Team>(`${this.baseUrl}/add/${clubId}`, team)
                  .pipe(
                    timeout(this.timeout),
                    retry(1),
                    catchError(retryErr => {
                      console.error('Failed to add team even after connection restored:', retryErr);
                      if (this.useMockData) {
                        console.warn('Using mock data as last resort');
                        const mockTeam = { ...team, id: Math.floor(Math.random() * 1000) };
                        return of(mockTeam as Team);
                      }
                      return throwError(() => retryErr);
                    })
                  );
              } else if (this.useMockData) {
                console.warn('Backend still unavailable, using mock data as last resort');
                const mockTeam = { ...team, id: Math.floor(Math.random() * 1000) };
                return of(mockTeam as Team);
              }
              return throwError(() => new Error('Backend connection failed and mock data not allowed'));
            })
          );
        })
      );
  }

  // Get team by ID
  getTeamById(teamId: number): Observable<TeamDto> {
    console.log(`Attempting to get team ${teamId} using API endpoint`);
    return this.http.get<TeamDto>(`${this.baseUrl}/${teamId}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        tap(response => {
          console.log('Successfully retrieved team via API endpoint', response);
          if (!response || (typeof response === 'object' && Object.keys(response).length <= 1)) {
            console.warn('Received incomplete team data for ID:', teamId);
          }
        }),
        catchError((error) => {
          console.warn(`Error in getTeamById ${teamId}, attempting to reconnect to backend before fallback:`, error);
          
          // Try to reconnect to backend before falling back
          return this.checkBackendConnection().pipe(
            switchMap(isAvailable => {
              if (isAvailable) {
                // If connection restored, retry the operation
                return this.http.get<TeamDto>(`${this.baseUrl}/${teamId}`)
                  .pipe(
                    timeout(this.timeout),
                    retry(1),
                    catchError(retryErr => {
                      console.error('Failed to get team even after connection restored:', retryErr);
                      if (this.useMockData) {
                        console.warn('Using mock data as last resort');
                        const mockTeam = this.mockTeams.find(t => t.teamId === teamId) || this.mockTeams[0];
                        return of({ ...mockTeam, teamId: teamId });
                      }
                      return throwError(() => retryErr);
                    })
                  );
              } else if (this.useMockData) {
                console.warn('Backend still unavailable, using mock data as last resort');
                const mockTeam = this.mockTeams.find(t => t.teamId === teamId) || this.mockTeams[0];
                return of({ ...mockTeam, teamId: teamId });
              }
              return throwError(() => new Error('Backend connection failed and mock data not allowed'));
            })
          );
        })
      );
  }

  // Assign a player to a team
  assignPlayerToTeam(playerId: number, teamId: number): Observable<TeamDto> {
    return this.http.post<TeamDto>(`${this.baseUrl}/${teamId}/assign-player/${playerId}`, {})
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        catchError((error) => {
          console.warn('Error in assignPlayerToTeam, fallback to mock data:', error);
          if (this.useMockData) {
            const mockTeam = this.mockTeams.find(t => t.teamId === teamId) || this.mockTeams[0];
            return of(mockTeam);
          }
          return throwError(() => error);
        })
      );
  }

  // Assign a coach to a team
  assignCoachToTeam(coachId: number, teamId: number): Observable<TeamDto> {
    return this.http.post<TeamDto>(`${this.baseUrl}/${teamId}/assign-coach/${coachId}`, {})
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        catchError((error) => {
          console.warn('Error in assignCoachToTeam, fallback to mock data:', error);
          if (this.useMockData) {
            const mockTeam = this.mockTeams.find(t => t.teamId === teamId) || this.mockTeams[0];
            return of(mockTeam);
          }
          return throwError(() => error);
        })
      );
  }

  // Remove a player from a team
  removePlayerFromTeam(playerId: number, teamId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${teamId}/remove-player/${playerId}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        catchError((error) => {
          console.warn('Error in removePlayerFromTeam, fallback to mock data:', error);
          if (this.useMockData) {
            return of('Player removed successfully (mock)');
          }
          return throwError(() => error);
        })
      );
  }

  // Remove a coach from a team
  removeCoachFromTeam(coachId: number, teamId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${teamId}/remove-coach/${coachId}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        catchError((error) => {
          console.warn('Error in removeCoachFromTeam, fallback to mock data:', error);
          if (this.useMockData) {
            return of('Coach removed successfully (mock)');
          }
          return throwError(() => error);
        })
      );
  }

  // Delete a team
  deleteTeam(teamId: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${teamId}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        catchError((error) => {
          console.warn('Error in deleteTeam, fallback to mock data:', error);
          if (this.useMockData) {
            return of('Team deleted successfully (mock)');
          }
          return throwError(() => error);
        })
      );
  }

  // Get team by coach ID
  getTeamByCoachId(coachId: number): Observable<TeamDto> {
    return this.http.get<TeamDto>(`${this.baseUrl}/coach/${coachId}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        catchError((error) => {
          console.warn('Error in getTeamByCoachId, fallback to mock data:', error);
          if (this.useMockData) {
            return of(this.mockTeams[0]);
          }
          return throwError(() => error);
        })
      );
  }

  // Get teams by club ID
  getTeamsByClubId(clubId: number): Observable<TeamDto[]> {
    return this.http.get<TeamDto[]>(`${this.baseUrl}/club/${clubId}`)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        catchError((error) => {
          console.warn('Error in getTeamsByClubId, fallback to mock data:', error);
          if (this.useMockData) {
            return of(this.mockTeams);
          }
          return throwError(() => error);
        })
      );
  }

  // Update a team
  updateTeam(teamId: number, team: TeamDto): Observable<TeamDto> {
    return this.http.put<TeamDto>(`${this.baseUrl}/${teamId}`, team)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        catchError((error) => {
          console.warn('Error in updateTeam, fallback to mock data:', error);
          if (this.useMockData) {
            return of({ ...team, id: teamId });
          }
          return throwError(() => error);
        })
      );
  }

  // Check if backend is available with more aggressive retry
  checkBackendConnection(): Observable<boolean> {
    // Use a simpler endpoint that's guaranteed to exist (like getting all teams)
    // instead of a special health-check endpoint that may not be implemented
    return this.http.get<any>(`${this.baseUrl}`, { observe: 'response' })
      .pipe(
        timeout(3000), // shorter timeout for health check
        retry(2), // More retries for health check
        map(response => response.status === 200),
        catchError(() => {
          console.warn('Backend server not available during health check');
          return of(false);
        })
      );
  }

  // Get players of a team using the dedicated endpoint
  getTeamPlayers(teamId: number): Observable<any[]> {
    console.log(`Fetching players for team ${teamId} from API endpoint`);
    return this.http.get<any[]>(`${this.baseUrl}/teams/${teamId}/players`)
      .pipe(
        timeout(this.timeout),
        retry(this.retries),
        tap(response => console.log('Successfully retrieved team players via API endpoint', response)),
        catchError((error) => {
          console.error(`Error fetching players for team ${teamId}:`, error);
          return throwError(() => new Error(`Failed to fetch players for team ${teamId}: ${error.message}`));
        })
      );
  }
}