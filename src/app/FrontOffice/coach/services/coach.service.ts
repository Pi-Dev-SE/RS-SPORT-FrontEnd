import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coach } from '../models/coach.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private apiUrl = `${environment.apiUrl}/coach`;

  constructor(private http: HttpClient) { }

  /**
   * Get a coach by ID
   */
  getCoachById(id: number): Observable<Coach> {
    return this.http.get<Coach>(`${this.apiUrl}/club/${id}`);
  }

  /**
   * Get coaches by club ID
   */
  getCoachesByClubId(clubId: number): Observable<Coach[]> {
    return this.http.get<Coach[]>(`${this.apiUrl}/getCoachesByClubId/${clubId}`);
  }

  /**
   * Get all coaches
   */
  getAllCoaches(): Observable<Coach[]> {
    return this.http.get<Coach[]>(`${this.apiUrl}`);
  }

  /**
   * Add a new coach using multipart/form-data format
   */
  addCoach(coach: Coach): Observable<Coach> {
    // Create a FormData object
    const formData = new FormData();
    
    // Add coach properties to FormData - convert String objects to primitive strings
    formData.append('firstname', coach.firstname.toString());
    formData.append('lastname', coach.lastname.toString());
    formData.append('email', coach.email.toString());
    formData.append('password', coach.password.toString());
    
    // Add optional date of birth if available
    if (coach.dateOfBirth) {
      formData.append('dateOfBirth', coach.dateOfBirth.toString());
    }
    
    // Add coach specific fields
    formData.append('specializationCoach', coach.specializationCoach.toString());
    formData.append('diplome', coach.diplome.toString());
    
    // Add club ID if available
    if (coach.club && coach.club.id) {
      formData.append('clubId', coach.club.id.toString());
    }
    
    // Send the request with FormData
    return this.http.post<Coach>(`${this.apiUrl}/addCoach`, formData);
  }

  /**
   * Update an existing coach
   */
  updateCoach(id: number, coach: Coach): Observable<Coach> {
    // For updates, we'll use a similar FormData approach
    const formData = new FormData();
    
    formData.append('firstname', coach.firstname.toString());
    formData.append('lastname', coach.lastname.toString());
    formData.append('email', coach.email.toString());
    
    // Only include password if it's provided (not empty)
    if (coach.password) {
      formData.append('password', coach.password.toString());
    }
    
    // Add optional date of birth if available
    if (coach.dateOfBirth) {
      formData.append('dateOfBirth', coach.dateOfBirth.toString());
    }
    
    // Add coach specific fields
    formData.append('specializationCoach', coach.specializationCoach.toString());
    formData.append('diplome', coach.diplome.toString());
    
    // Add club ID if available
    if (coach.club && coach.club.id) {
      formData.append('clubId', coach.club.id.toString());
    }
    
    return this.http.put<Coach>(`${this.apiUrl}/updateCoach/${id}`, formData);
  }

  /**
   * Delete a coach
   */
  deleteCoach(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteCoach/${id}`);
  }
}