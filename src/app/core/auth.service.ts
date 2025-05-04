import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8088/spr01';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Vérifier si un utilisateur est déjà connecté au démarrage
    this.checkLocalStorage();
  }

  private checkLocalStorage(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        console.log('Utilisateur chargé avec succès');
      } catch (e) {
        console.error('Erreur lors du chargement des données utilisateur:', e);
        this.logout();
      }
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, userData);
  }

  login(email: string, password: string): Observable<any> {
    // Préparer les données d'authentification dans le format attendu par le backend
    const loginData = {
      email: email,
      password: password
    };

    // Ajouter les en-têtes appropriés pour l'authentification
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };

    return this.http.post<any>(`${this.apiUrl}/login`, loginData, httpOptions)
      .pipe(
        tap(response => {
          if (response && response.user) {
            // Stocker les données utilisateur dans le localStorage
            localStorage.setItem('user_data', JSON.stringify(response.user));

            // Mettre à jour l'utilisateur courant
            this.currentUserSubject.next(response.user);
            this.isLoggedInSubject.next(true);
          } else {
            // Si la réponse ne contient pas d'utilisateur, créer un utilisateur minimal
            const minimalUser = { email: email };
            localStorage.setItem('user_data', JSON.stringify(minimalUser));
            this.currentUserSubject.next(minimalUser);
            this.isLoggedInSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    // 1) Récupérer l'utilisateur courant (depuis le BehaviorSubject ou le localStorage)
    const currentUser = this.currentUserSubject.getValue();
    const email = currentUser?.email;

    if (email) {
      // 2) Appeler l'API logout
      this.http.post(`${this.apiUrl}/logout/${email}`, {}, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(err => {
          console.error('Erreur lors de la déconnexion back-end :', err);
          return of(null);  // On continue malgré l'erreur
        })
      ).subscribe({
        complete: () => {
          // 3) Une fois l'appel terminé, on fait le reset local
          localStorage.removeItem('user_data');
          this.currentUserSubject.next(null);
          this.isLoggedInSubject.next(false);
          this.router.navigate(['/']);
        }
      });
    } else {
      // Pas d'utilisateur identifié : simple reset local
      localStorage.removeItem('user_data');
      this.currentUserSubject.next(null);
      this.isLoggedInSubject.next(false);
      this.router.navigate(['/']);
    }
  }


  getUserProfile(): Observable<any> {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      return of(null);
    }

    try {
      const user = JSON.parse(userData);
      return of(user);
    } catch (e) {
      console.error('Erreur lors de la lecture des données utilisateur:', e);
      return of(null);
    }

    // Si besoin de rafraîchir les données depuis le serveur
    // return this.http.get<any>(`${this.apiUrl}/user/profile`).pipe(
    //   tap(user => {
    //     if (user) {
    //       localStorage.setItem('user_data', JSON.stringify(user));
    //       this.currentUserSubject.next(user);
    //     }
    //   }),
    //   catchError(error => {
    //     console.error('Erreur lors de la récupération du profil utilisateur:', error);
    //     return of(null);
    //   })
    // );
  }


  isAuthenticated(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  // Méthode pour obtenir les en-têtes HTTP standards
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }
}
