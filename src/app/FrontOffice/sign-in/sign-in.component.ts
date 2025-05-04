import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  returnUrl: string = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer l'URL de retour des paramètres de requête ou utiliser la page d'accueil par défaut
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Vérifier si l'utilisateur est déjà authentifié
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate([this.returnUrl]);
      }
    });

    // Initialiser le formulaire
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs de validation
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        // Vérifier si l'authentification a réussi en vérifiant les données utilisateur
        if (localStorage.getItem('user_data')) {
          // Rediriger vers la page de retour ou la page d'accueil après connexion réussie
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = 'Échec authentification: données utilisateur non reçues';
        }
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        // Réinitialiser le mot de passe pour permettre une nouvelle tentative
        this.loginForm.get('password')?.reset();
        this.loginForm.get('password')?.markAsTouched();

        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
        } else if (error.status === 404) {
          this.errorMessage = 'Utilisateur non trouvé. Veuillez vérifier votre email.';
        } else if (error.error && typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

