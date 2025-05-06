import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoachService } from '../../services/coach.service';
import { Coach } from '../../models/coach.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-coach-form',
  templateUrl: './coach-form.component.html',
  styleUrls: ['./coach-form.component.scss']
})
export class CoachFormComponent implements OnInit {
  coachForm!: FormGroup; // Using definite assignment assertion
  isEditMode = false;
  coachId = 0; // Default value to avoid null errors
  isLoading = false;
  isSubmitting = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private coachService: CoachService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.coachId = +params['id'];
        this.loadCoachData();
      }
    });
  }

  // Getter for form controls
  get f() { return this.coachForm.controls; }

  initForm(): void {
    this.coachForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', [Validators.required]],
      password: ['', this.isEditMode ? [] : [Validators.required]],
      specializationCoach: ['', [Validators.required]],
      diplome: ['', [Validators.required]],
      clubId: [1, [Validators.required]] // Default club ID value
    });

    // Make password optional in edit mode
    if (this.isEditMode) {
      const passwordControl = this.coachForm.get('password');
      if (passwordControl) {
        passwordControl.setValidators(null);
        passwordControl.updateValueAndValidity();
      }
    }
  }

  loadCoachData(): void {
    this.isLoading = true;
    this.coachService.getCoachById(this.coachId)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (coach) => {
          // Patch the form with coach data, excluding password
          this.coachForm.patchValue({
            firstname: coach.firstname,
            lastname: coach.lastname,
            email: coach.email,
            dateOfBirth: coach.dateOfBirth,
            specializationCoach: coach.specializationCoach,
            diplome: coach.diplome,
            clubId: coach.club?.id || 1
          });
        },
        error: (error) => {
          this.errorMessage = 'Failed to load coach data. Please try again.';
          console.error('Error loading coach:', error);
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.coachForm.invalid) {
      console.log('Form invalid:', this.coachForm.errors);
      return;
    }

    this.isSubmitting = true;
    
    // Create a new Coach instance with form values
    const formValues = this.coachForm.value;
    const coach = new Coach(
      this.isEditMode ? this.coachId : 0, // Use 0 as a default when creating new
      formValues.firstname,
      formValues.lastname,
      formValues.email,
      formValues.password,
      formValues.specializationCoach,
      formValues.diplome,
      { id: formValues.clubId }, // Set the club as an object with the ID
      undefined, // team (optional)
      formValues.dateOfBirth
    );

    // Log what's being sent to the server for debugging
    console.log('Submitting coach data:', coach);

    const request = this.isEditMode
      ? this.coachService.updateCoach(this.coachId, coach)
      : this.coachService.addCoach(coach);

    request.pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        console.log('Success response:', response);
        // Navigate back to coaches list
        this.router.navigate(['/coaches']);
      },
      error: (error) => {
        console.error('Error response:', error);
        this.errorMessage = this.isEditMode
          ? 'Failed to update coach. Please try again.'
          : 'Failed to add coach. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/coaches']);
  }
}