// training-session.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Exercise } from '../../exercises/model/exercise';
import { WeatherData } from '../model/weatherData';

@Injectable({
  providedIn: 'root'
})
export class TrainingSessionService {
  private baseUrl = 'http://localhost:8088/spr01/api/sessions';

  constructor(private http: HttpClient) { }
  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getAllSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/GetAll`);
  }

  getSessionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getById/${id}`);
  }

  createSession(session: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, session);
  }
  

  updateSession(id: number, session: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/Update/${id}`, session);
  }

  deleteSession(id: number): Observable<any[]> {
    return this.http.delete<any[]>(`${this.baseUrl}/deleteById/${id}`);
  }

  addExercisesToSession(sessionId: number, exercises: any[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/addExercicesToSession/${sessionId}/exercises`, exercises);
  }
  getAllCoaches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/GetAllCoaches`);
  }

  assignExercisesToSession(
    sessionId: number,
    targetObjective: string,
    maxDuration: string,
    allowedExerciseTypes: string[],
    coachId: number,
    maxExercises: number
): Observable<any> {
    let params = new HttpParams()
      .set('sessionId', sessionId.toString())
      .set('targetObjective', targetObjective)
      .set('maxDuration', maxDuration)
      .set('coachId', coachId.toString())
      .set('maxExercises', maxExercises.toString());

    allowedExerciseTypes.forEach(type => {
      params = params.append('exerciseTypes', type);
    });

    return this.http.put<any>(`${this.baseUrl}/assign-exercises`, null, { params });
}
getSessionProgress(sessionId: number): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/progress/${sessionId}`);
}

  // training-session.service.ts
getExercisesForSession(sessionId: number): Observable<Exercise[]> {
  return this.http.get<Exercise[]>(`${this.baseUrl}/${sessionId}/exercises`);
}
checkWeatherBeforeCreatingSession(city: string, date: string): Observable<WeatherData> {
  return this.http.get<WeatherData>(`${this.baseUrl}/check-weather?city=${city}&date=${date}`);
}
// Nouvelle méthode : Analyser les performances d'un coach
analyzePerformance(startDate: string, endDate: string): Observable<string> {
  const params = new HttpParams()
    .set('startDate', startDate)
    .set('endDate', endDate);

  return this.http.get(this.baseUrl + '/analyze', { params, responseType: 'text' });
}
}


