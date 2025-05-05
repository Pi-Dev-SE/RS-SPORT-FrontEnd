import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from "@angular/router";
import { ExerciseType, Visibility, Exercise } from "../model/exercise";
import { CommonModule } from "@angular/common";
import { ExerciseService } from "../service/exercise-service.service";

@Component({
  selector: 'app-creat-exercice',
  
  templateUrl: './creat-exercice.component.html',
  styleUrl: './creat-exercice.component.css',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  standalone: true
})
export class CreatExerciceComponent implements OnInit {
  exerciseForm!: FormGroup;
  exerciseTypes = Object.values(ExerciseType);
  visibilityOptions = Object.values(Visibility);
  isSubmitting = false;
  isUpdateMode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private exerciseService: ExerciseService,
    private dialogRef: MatDialogRef<CreatExerciceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Exercise
  ) {}

  ngOnInit(): void {
    this.isUpdateMode = !!this.data.id;
    this.initForm();
  }

  initForm(): void {
    const currentDate = new Date().toISOString().split('T')[0];
    
    this.exerciseForm = this.fb.group({
      name: [this.data.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      exerciseType: [this.data.exerciseType || ExerciseType.PHYSICAL, Validators.required],
      description: [this.data.description || '', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      duration: [this.data.duration || '', Validators.required],
      objectif: [this.data.objectif || '', Validators.required],
      image: [this.data.image || ''],
      videoUrl: [this.data.videoUrl || ''],
      visibility: [this.data.visibility || Visibility.PUBLIC, Validators.required],
      creationDate: [this.data.creationDate || currentDate, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      this.exerciseForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    const exercise: Exercise = this.exerciseForm.value;

    console.log('Submitting exercise data:', exercise); // Log the data being sent

    if (this.isUpdateMode) {
      this.updateExercise(exercise);
    } else {
      this.createExercise(exercise);
    }
  }

  createExercise(exercise: Exercise): void {
    this.exerciseService.createExercise(exercise, 1, 1).subscribe({
      next: (newExercise) => {
        this.dialogRef.close(newExercise);
      },
      error: (error) => {
        console.error('Error creating exercise', error);
        this.isSubmitting = false;
      }
    });
  }

  updateExercise(exercise: Exercise): void {
    this.exerciseService.update(exercise, Number(this.data.id)).subscribe({
      next: (updatedExercise) => {
        this.dialogRef.close(updatedExercise);
      },
      error: (error) => {
        console.error('Error updating exercise', error);
        console.log('Exercise data sent for update:', exercise); // Log the data being sent
        this.isSubmitting = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.exerciseForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  resetForm(): void {
    this.exerciseForm.reset({
      exerciseType: ExerciseType.PHYSICAL,
      visibility: Visibility.PUBLIC,
      creationDate: new Date().toISOString().split('T')[0]
    });
  }
}
