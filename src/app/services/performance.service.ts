import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PerformanceTracking } from '../Models/PerformanceTracking';
import { TendanceProgression } from '../Models/TendanceProgression';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {


  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8088/spr01/Performance';

  addPerformance (performance:PerformanceTracking) : Observable<PerformanceTracking> {
    return this.http.post<PerformanceTracking>(`${this.apiUrl}/addPerformance`, performance);
  }

  getHistoriqueJoueur(playerId: number): Observable<PerformanceTracking[]> {
    return this.http.get<PerformanceTracking[]>(`${this.apiUrl}/history/${playerId}`);
  }
  getDernierePerformance(playerId: number): Observable<PerformanceTracking> {
    return this.http.get<PerformanceTracking>(`${this.apiUrl}/last/${playerId}`);
  }

  getTendanceProgression(playerId: number, debut: string, fin: string): Observable<TendanceProgression> {
    return this.http.get<TendanceProgression>(`${this.apiUrl}/trend/${playerId}?debut=${debut}&fin=${fin}`);
  }


  // Obtenir les recommandations pour un joueur
  getRecommandations(playerId: number): Observable<{recommendations: string}> {
    return this.http.get<{recommendations: string}>(`${this.apiUrl}/recommandations/${playerId}`);
  }

  getPerformance(id: number): Observable <PerformanceTracking>{
    return this.http.get<PerformanceTracking>(`${this.apiUrl}/retrieve-performance/${id}`)
  }

  deletePerformance(id:number) : Observable <void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-performance/${id}`);
  }

  updatePerformance(id:number , performance:PerformanceTracking) : Observable <PerformanceTracking>{
    return this.http.put<PerformanceTracking>(`${this.apiUrl}/update-performance/${id}`, performance);
  }

}
