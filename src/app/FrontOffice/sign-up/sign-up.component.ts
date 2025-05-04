import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  roles = ['PLAYER', 'COACH', 'MEDICALSTAFF', 'ADMIN'];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.signupForm = this.formBuilder.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      avatarUrl: ['', [Validators.pattern('https?://.+')]],
      roleUser: ['ADMIN', Validators.required],
      // Champs spécifiques aux rôles
      department: [''],
      adminLevel: [''],
      specializationCoach: [''],
      diplome: [''],
      specializationMed: [''],
      licenseNumber: [''],
      jerseyNumber: [null]
    });

    // Écouter les changements de rôle pour ajuster la validation
    this.signupForm.get('roleUser')?.valueChanges.subscribe(role => {
      this.updateValidatorsBasedOnRole(role);
    });

    // Initialiser les validateurs pour le rôle par défaut
    this.updateValidatorsBasedOnRole('PLAYER');
  }

  updateValidatorsBasedOnRole(role: string): void {
    // Réinitialiser tous les validateurs spécifiques aux rôles
    this.signupForm.get('department')?.clearValidators();
    this.signupForm.get('adminLevel')?.clearValidators();
    this.signupForm.get('specializationCoach')?.clearValidators();
    this.signupForm.get('diplome')?.clearValidators();
    this.signupForm.get('specializationMed')?.clearValidators();
    this.signupForm.get('licenseNumber')?.clearValidators();
    this.signupForm.get('jerseyNumber')?.clearValidators();

    // Appliquer les validateurs en fonction du rôle sélectionné
    switch (role) {
      case 'ADMIN':
        this.signupForm.get('department')?.setValidators([Validators.required]);
        this.signupForm.get('adminLevel')?.setValidators([Validators.required]);
        break;
      case 'COACH':
        this.signupForm.get('specializationCoach')?.setValidators([Validators.required]);
        this.signupForm.get('diplome')?.setValidators([Validators.required]);

        break;
      case 'MEDICALSTAFF':
        this.signupForm.get('specializationMed')?.setValidators([Validators.required]);
        this.signupForm.get('licenseNumber')?.setValidators([Validators.required]);
        break;
      case 'PLAYER':
        this.signupForm.get('jerseyNumber')?.setValidators([Validators.required, Validators.min(1), Validators.max(99)]);
        break;
    }

    // Mettre à jour les validateurs
    this.signupForm.get('department')?.updateValueAndValidity();
    this.signupForm.get('adminLevel')?.updateValueAndValidity();
    this.signupForm.get('specializationCoach')?.updateValueAndValidity();
    this.signupForm.get('diplome')?.updateValueAndValidity();
    this.signupForm.get('specializationMed')?.updateValueAndValidity();
    this.signupForm.get('licenseNumber')?.updateValueAndValidity();
    this.signupForm.get('jerseyNumber')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données en fonction du rôle sélectionné
    const userData: {
      firstname: string;
      lastname: string;
      email: string;
      password: string;
      avatarUrl?: string;
      roleUser: string;
      department?: string;
      adminLevel?: string;
      specializationCoach?: string;
      diplome?: string;
      specializationMed?: string;
      licenseNumber?: string;
      jerseyNumber?: number;
    } = {
      firstname: this.signupForm.value.firstname,
      lastname: this.signupForm.value.lastname,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      avatarUrl: this.signupForm.value.avatarUrl,
      roleUser: this.signupForm.value.roleUser
    };

    // Ajouter les champs spécifiques au rôle
    switch (this.signupForm.value.roleUser) {
      case 'ADMIN':
        userData['department'] = this.signupForm.value.department;
        userData['adminLevel'] = this.signupForm.value.adminLevel;
        break;
      case 'COACH':
        userData['specializationCoach'] = this.signupForm.value.specializationCoach;
        userData['diplome'] = this.signupForm.value.diplome;
        break;
      case 'MEDICALSTAFF':
        userData['specializationMed'] = this.signupForm.value.specializationMed;
        userData['licenseNumber'] = this.signupForm.value.licenseNumber;
        break;
      case 'PLAYER':
        userData['jerseyNumber'] = this.signupForm.value.jerseyNumber;
        break;
    }

    this.authService.register(userData).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: (response) => {
        this.successMessage = 'Inscription réussie ! Vous allez être redirigé vers la page de connexion.';

        // Stocker temporairement les données utilisateur pour faciliter la connexion
        if (response && response.user) {
          // On ne stocke pas encore les données utilisateur car l'utilisateur doit d'abord se connecter
          console.log('Utilisateur créé avec succès:', response.user);
        }

        // Réinitialiser le formulaire après une inscription réussie
        this.signupForm.reset();
        this.signupForm.patchValue({ roleUser: 'PLAYER' }); // Remettre le rôle par défaut
        this.updateValidatorsBasedOnRole('PLAYER');

        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 2000);
      },
      error: (error) => {
        if (error.status === 409 || (error.error && error.error.message === 'Email already exists')) {
          this.errorMessage = 'Cet email est déjà utilisé';
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer plus tard.';
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
