import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {
  private apiUrl = 'http://localhost:8088/spr01/signup';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  // Méthode pour vérifier si un email existe déjà
  checkEmailExists(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check-email?email=${email}`);
  }
}
