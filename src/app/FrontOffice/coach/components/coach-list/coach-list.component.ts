import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoachService } from '../../services/coach.service';
import { Coach } from '../../models/coach.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-coach-list',
  templateUrl: './coach-list.component.html',
  styleUrls: ['./coach-list.component.css']
})
export class CoachListComponent implements OnInit, OnChanges {
  // Input property to accept club ID from parent component
  @Input() clubId: number = 1;
  
  // Coaches data
  coaches: Coach[] = [];
  filteredCoaches: Coach[] = [];
  selectedCoach: Coach | null = null;
  
  // UI state variables
  isLoading = false;
  isAdding = false;
  isEditing = false;
  isSubmitting = false;
  searchTerm = '';
  
  // Message handling
  successMessage = '';
  errorMessage = '';
  
  // Form and image handling
  coachForm!: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  
  // Club ID to load coaches for - will use the @Input clubId
  get currentClubId(): number {
    return this.clubId;
  }

  constructor(
    private coachService: CoachService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCoachesByClubId();
  }
  
  // Detect when the clubId input property changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clubId'] && !changes['clubId'].firstChange) {
      // Reload coaches when clubId changes
      this.loadCoachesByClubId();
    }
  }

  // Initialize the form
  initForm(): void {
    this.coachForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
      dateOfBirth: ['', [Validators.required]],
      specializationCoach: ['', [Validators.required]],
      diplome: ['', [Validators.required]],
      clubId: [this.currentClubId, [Validators.required]]
    });

    if (this.isEditing) {
      const passwordControl = this.coachForm.get('password');
      if (passwordControl) {
        passwordControl.setValidators(null);
        passwordControl.updateValueAndValidity();
      }
    }
  }

  // Load coaches for the current club ID
  loadCoachesByClubId(): void {
    this.isLoading = true;
    this.coachService.getCoachesByClubId(this.currentClubId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.coaches = data;
          this.filteredCoaches = [...this.coaches];
          this.clearMessages();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load coaches. Please try again.';
          console.error('Error loading coaches:', error);
        }
      });
  }

  // Filter coaches based on search term
  filterCoaches(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCoaches = [...this.coaches];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredCoaches = this.coaches.filter(coach => 
      coach.firstname?.toLowerCase().includes(term) ||
      coach.lastname?.toLowerCase().includes(term) ||
      coach.email?.toLowerCase().includes(term) ||
      coach.specializationCoach?.toLowerCase().includes(term) ||
      coach.diplome?.toLowerCase().includes(term)
    );
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredCoaches = [...this.coaches];
  }

  // Add new coach
  addNewCoach(): void {
    this.selectedCoach = null;
    this.isAdding = true;
    this.isEditing = false;
    this.previewUrl = null;
    this.selectedFile = null;
    this.initForm();
  }

  // View coach details
  viewCoachDetails(id: number): void {
    this.isLoading = true;
    this.coachService.getCoachById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (coach) => {
          this.selectedCoach = coach;
          this.isAdding = false;
          this.isEditing = false;
          this.clearMessages();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load coach details. Please try again.';
          console.error('Error loading coach details:', error);
        }
      });
  }

  // Edit coach
  editCoach(id: number): void {
    if (this.selectedCoach && this.selectedCoach.id === id) {
      // If already selected, just switch to edit mode
      this.prepareFormForEdit(this.selectedCoach);
    } else {
      // Otherwise, load the coach data first
      this.isLoading = true;
      this.coachService.getCoachById(id)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (coach) => {
            this.selectedCoach = coach;
            this.prepareFormForEdit(coach);
          },
          error: (error) => {
            this.errorMessage = 'Failed to load coach data for editing. Please try again.';
            console.error('Error loading coach for edit:', error);
          }
        });
    }
  }

  // Prepare form for editing
  prepareFormForEdit(coach: Coach): void {
    this.isEditing = true;
    this.isAdding = false;
    
    // Reset password validators for edit mode
    const passwordControl = this.coachForm.get('password');
    if (passwordControl) {
      passwordControl.setValidators(null);
      passwordControl.updateValueAndValidity();
    }
    
    this.coachForm.patchValue({
      firstname: coach.firstname,
      lastname: coach.lastname,
      email: coach.email,
      dateOfBirth: coach.dateOfBirth,
      specializationCoach: coach.specializationCoach,
      diplome: coach.diplome,
      clubId: coach.club?.id || this.currentClubId
    });
    
    // Reset the password field
    this.coachForm.get('password')?.setValue('');
    
    // Display coach image if exists
    if (coach.coachImage) {
      this.previewUrl = coach.coachImage;
    }
  }

  // Delete coach
  deleteCoach(id: number): void {
    if (confirm('Are you sure you want to delete this coach?')) {
      this.isLoading = true;
      this.coachService.deleteCoach(id)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Coach deleted successfully.';
            this.loadCoachesByClubId(); // Reload coaches after deletion
            
            if (this.selectedCoach && this.selectedCoach.id === id) {
              this.selectedCoach = null;
            }
          },
          error: (error) => {
            this.errorMessage = 'Failed to delete coach. Please try again.';
            console.error('Error deleting coach:', error);
          }
        });
    }
  }

  // Handle file selection for coach image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Submit form
  onSubmit(): void {
    if (this.coachForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.coachForm.controls).forEach(key => {
        const control = this.coachForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    
    const formValues = this.coachForm.value;
    
    // Create coach object
    const coach = new Coach(
      this.isEditing && this.selectedCoach ? this.selectedCoach.id : 0,
      formValues.firstname,
      formValues.lastname,
      formValues.email,
      formValues.password,
      formValues.specializationCoach,
      formValues.diplome,
      { id: formValues.clubId },
      undefined,
      formValues.dateOfBirth
    );
    
    // If image is selected, add it to the coach
    if (this.selectedFile) {
      // In a real application, you'd upload the file to a server and get back a URL
      // For now, we'll just store the preview URL
      coach.coachImage = this.previewUrl?.toString();
    }

    const request = this.isEditing
      ? this.coachService.updateCoach(coach.id || 0, coach)
      : this.coachService.addCoach(coach);

    request
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.successMessage = this.isEditing
            ? 'Coach updated successfully.'
            : 'Coach added successfully.';
          
          this.loadCoachesByClubId(); // Reload coaches after update
          
          if (this.isEditing) {
            this.selectedCoach = response;
          } else {
            this.selectedCoach = null;
          }
          
          this.isEditing = false;
          this.isAdding = false;
        },
        error: (error) => {
          this.errorMessage = this.isEditing
            ? 'Failed to update coach. Please try again.'
            : 'Failed to add coach. Please try again.';
          console.error('Error saving coach:', error);
        }
      });
  }

  // Cancel edit/add
  onCancel(): void {
    this.isEditing = false;
    this.isAdding = false;
    this.previewUrl = null;
    this.selectedFile = null;
    this.clearMessages();
  }

  // Back to list
  backToList(): void {
    this.selectedCoach = null;
    this.clearMessages();
  }

  // Clear alert messages
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Check if the coach has an image
  hasCoachImage(coach: Coach): boolean {
    return !!coach.coachImage;
  }
}