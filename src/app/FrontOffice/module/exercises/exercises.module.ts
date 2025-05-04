import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExercisesRoutingModule } from './exercises-routing.module';
import { ExerciseComponent } from './exercise/exercise.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CreatExerciceComponent } from './creat-exercice/creat-exercice.component';
import { ConfirmDialogComponent } from './Component/confirm-dialog/confirm-dialog.component';


@NgModule({
  declarations: [
    
  
  ],
  imports: [
    CommonModule,
    ExercisesRoutingModule,
    ReactiveFormsModule, FormsModule, CommonModule
  ]
})
export class ExercisesModule { }
