import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Location } from "@angular/common";
import { Exercise } from '../Models/exercise';
import { mergeMap } from 'rxjs/operators';  // Importation de mergeMap

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = 'http://localhost:8089/exercice'; 

  constructor(private http: HttpClient, private location: Location) {}

  create(exercise: Exercise, image: File | null): Observable<Exercise> {
    if (image) {
      return this.uploadImage(image).pipe(
        mergeMap((imageUrl) => {
          exercise.image = imageUrl;
          return this.http.post<Exercise>(`${this.apiUrl}/create`, exercise);
        })
      );
    } else {
      return this.http.post<Exercise>(`${this.apiUrl}/create`, exercise);
    }
  }

  findById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/findBy/${id}`);
  }

  findAll(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}/findAll`);
  }

  update(exercise: Exercise, image: File | null): Observable<Exercise> {
    if (image) {
      return this.uploadImage(image).pipe(
        mergeMap((imageUrl) => {
          exercise.image = imageUrl;
          return this.http.put<Exercise>(`${this.apiUrl}/update`, exercise);
        })
      );
    } else {
      return this.http.put<Exercise>(`${this.apiUrl}/update`, exercise);
    }
  }

  delete(id: number): Observable<Exercise[]> {
    return this.http.delete<Exercise[]>(`${this.apiUrl}/delete/${id}`);
  }

  private uploadImage(image: File): Observable<string> {
    return of(`https://fake-upload.com/${image.name}`);
  }
}
