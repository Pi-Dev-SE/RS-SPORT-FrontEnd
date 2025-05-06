import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoachListComponent } from './components/coach-list/coach-list.component';
import { CoachDetailComponent } from './components/coach-detail/coach-detail.component';
import { CoachFormComponent } from './components/coach-form/coach-form.component';

const routes: Routes = [
  { 
    path: '', 
    component: CoachListComponent,
  },
  { 
    path: 'detail/:id', 
    component: CoachDetailComponent,
    data: { title: 'Coach Details', breadcrumb: 'Coach Details' }
  },
  { 
    path: 'add', 
    component: CoachFormComponent,
    data: { title: 'Add New Coach', breadcrumb: 'Add Coach' }
  },
  { 
    path: 'edit/:id', 
    component: CoachFormComponent,
    data: { title: 'Edit Coach', breadcrumb: 'Edit Coach' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoachRoutingModule { } 