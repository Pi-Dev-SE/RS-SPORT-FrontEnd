import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../model/exercise';
import { PageResponse } from '../model/PageResponse';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  getExerciseById(id: number) {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'http://localhost:8088/spr01/api/exercice';
  constructor(private http: HttpClient) {}

  getAllExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.baseUrl}/findAll`);
  }  

  getExercisesPaginated(page: number, size: number): Observable<PageResponse<Exercise>> {
    return this.http.get<PageResponse<Exercise>>(`${this.baseUrl}/findAll-page`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }
  
  
  
  
  
  


  findAll(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.baseUrl}/findAll`);
  }

  findById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.baseUrl}/${id}`);
  }

  createExercise(exercise: Exercise, teamId: number, coachId: number): Observable<Exercise> {
    return this.http.post<Exercise>(`${this.baseUrl}/create/${teamId}/${coachId}`, exercise);
  }

  update(exercise: Exercise, id: number): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.baseUrl}/update/${id}`, exercise);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
  updateExerciseRating(exerciseId: number, rating: number): Observable<Exercise> {
    return this.http.patch<Exercise>(`${this.baseUrl}/${exerciseId}/rating`, rating);
  }
  
  markExerciseAsCompleted(exerciseId: number, completed: boolean): Observable<Exercise> {
    return this.http.patch<Exercise>(`${this.baseUrl}/${exerciseId}/complete`, completed);
  }
 

  getAverageRating(exerciseId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${exerciseId}/average-rating`);
  }
  addRatingToExercise(exerciseId: number, ratingValue: number): Observable<any> {
    const url = `${this.baseUrl}/${exerciseId}/ratings`;
    return this.http.post(url, null, {
      params: { rating: ratingValue.toString() }
    });
  }
  getStatsByCoach(coachId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/coach/${coachId}/stats`);
  }
  reorderExercises(order: { id: number; order: number }[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reorder`, order);
  }
}