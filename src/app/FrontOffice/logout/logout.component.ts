import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-logout',
  template: `
    <div class="logout-container">
      <div class="logout-box">
        <div class="spinner"></div>
        <h2>Déconnexion en cours...</h2>
        <p>Vous allez être redirigé vers la page d'accueil.</p>
      </div>
    </div>
  `,
  styles: [
    `
    .logout-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    .logout-box {
      text-align: center;
      padding: 2rem;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }
    h2 {
      margin-top: 1rem;
      color: #333;
    }
    p {
      color: #666;
      margin-top: 0.5rem;
    }
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #3498db;
      width: 40px;
      height: 40px;
      margin: 0 auto;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    `
  ]
})
export class LogoutComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Déconnecter l'utilisateur
    this.authService.logout();

    // Rediriger vers la page d'accueil après déconnexion
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000); // Délai pour afficher le message de déconnexion
  }
}
