import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SignInService {
  private apiUrl = 'http://localhost:8088/spr01/login';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password })
      .pipe(
        tap(response => {
          if (response && response.user) {
            // Stocker les données utilisateur dans le localStorage
            localStorage.setItem('user_data', JSON.stringify(response.user));
          } else if (response) {
            // Si la réponse ne contient pas d'utilisateur, créer un utilisateur minimal
            const minimalUser = { email: email };
            localStorage.setItem('user_data', JSON.stringify(minimalUser));
          }
        })
      );
  }

  logout(): void {
    // Supprimer les données utilisateur du localStorage
    localStorage.removeItem('user_data');
  }

  isLoggedIn(): boolean {
    // Vérifier si les données utilisateur existent dans le localStorage
    return !!localStorage.getItem('user_data');
  }

  getUserData(): any | null {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('Erreur lors de la lecture des données utilisateur:', e);
        return null;
      }
    }
    return null;
  }

  // Méthode pour obtenir les en-têtes HTTP standards
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }
}
