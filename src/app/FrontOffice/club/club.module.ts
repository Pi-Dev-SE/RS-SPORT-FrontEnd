import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ClubListComponent } from './components/club-list/club-list.component';
import { ClubDetailsComponent } from './components/club-details/club-details.component';
import { ClubFormComponent } from './components/club-form/club-form.component';
import { ClubService } from './services/club.service';
import { TeamFormComponent } from '../team-form/team-form.component';
import { TeamManagementComponent } from '../team-management/team-management.component';

const routes: Routes = [
  { path: 'clubs', component: ClubListComponent },
  { path: 'clubs/:id', component: ClubDetailsComponent },
  { path: 'add-club', component: ClubFormComponent },
  { path: 'edit-club/:id', component: ClubFormComponent },
  { path: 'team-management/:id', component: TeamManagementComponent },
   
];

@NgModule({
  declarations: [
    ClubListComponent,
    ClubDetailsComponent,
    ClubFormComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [ClubService],
  exports: [RouterModule]
})
export class ClubModule { }
