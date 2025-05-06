import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoachListComponent } from './components/coach-list/coach-list.component';
import { CoachDetailComponent } from './components/coach-detail/coach-detail.component';
import { CoachFormComponent } from './components/coach-form/coach-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CoachService } from './services/coach.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { CoachRoutingModule } from './coach-routing.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    CoachListComponent,
    CoachDetailComponent,
    CoachFormComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CoachRoutingModule,
    RouterModule,
    // Material Modules

  ],
  providers: [CoachService],
  exports: [
    CoachListComponent,
    CoachDetailComponent,
    CoachFormComponent
  ]
})
export class CoachModule { }
