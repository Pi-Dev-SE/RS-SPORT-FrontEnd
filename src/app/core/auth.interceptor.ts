import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem('user_data');

    // Ne pas ajouter d'en-têtes d'authentification pour les requêtes de connexion/inscription
    const isAuthUrl = request.url.includes('/signup') || request.url.includes('/signin');

    if (userData && !isAuthUrl) {
      try {
        // Récupérer les données utilisateur
        const user = JSON.parse(userData);

        // Ajouter les en-têtes d'authentification
        request = request.clone({
          setHeaders: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Ajouter d'autres en-têtes si nécessaire, comme un jeton d'authentification
            // 'Authorization': `Bearer ${user.token}` // Décommenter si le backend utilise des jetons
          }
        });
      } catch (e) {
        console.error('Erreur lors de la lecture des données utilisateur:', e);
      }
    } else {
      // Pour les requêtes d'authentification, ajouter uniquement les en-têtes de base
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    }

    // Passer la requête modifiée au gestionnaire suivant
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gérer les erreurs d'authentification (401 Unauthorized)
        if (error.status === 401) {
          // Vérifier si c'est une tentative de connexion ou d'inscription
          const isAuthRequest = request.url.includes('/signin') || request.url.includes('/signup');

          if (!isAuthRequest) {
            console.error('Session expirée ou non autorisé', error);
            console.log('Déconnexion suite à une erreur 401');
            // Déconnecter l'utilisateur et rediriger vers la page de connexion
            localStorage.removeItem('user_data');
            this.router.navigate(['/']);
          }
        }
        return throwError(() => error);
      })
    );
  }

}
