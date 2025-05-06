import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamStatistics } from '../Models/team-statistics.model';

@Injectable({
  providedIn: 'root'
})
export class TeamStatisticsService {
  private apiUrl = 'http://localhost:8088/spr01/api/team-stats';

  constructor(private http: HttpClient) { }

  // Get all team statistics
  getAllTeamStatistics(): Observable<TeamStatistics[]> {
    return this.http.get<TeamStatistics[]>(`${this.apiUrl}`);
  }

  // Get statistics for a specific team
  getTeamStatistics(teamId: number): Observable<TeamStatistics[]> {
    return this.http.get<TeamStatistics[]>(`${this.apiUrl}/team/${teamId}`);
  }

  // Get a specific statistic record by ID
  getTeamStatisticById(statId: number): Observable<TeamStatistics> {
    return this.http.get<TeamStatistics>(`${this.apiUrl}/${statId}`);
  }

  // Add statistics to a team
  addTeamStatistics(teamId: number, statistics: TeamStatistics): Observable<TeamStatistics> {
    return this.http.post<TeamStatistics>(`${this.apiUrl}/add/${teamId}`, statistics);
  }

  // Update team statistics
  updateTeamStatistics(statId: number, statistics: TeamStatistics): Observable<TeamStatistics> {
    return this.http.put<TeamStatistics>(`${this.apiUrl}/${statId}`, statistics);
  }

  // Delete team statistics
  deleteTeamStatistics(statId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${statId}`);
  }
}