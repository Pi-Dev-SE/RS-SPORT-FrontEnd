import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllTemplateFrontComponent } from './FrontOffice/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffice/all-template-back/all-template-back.component';
import { HomeFrontComponent } from './FrontOffice/home-front/home-front.component';
import { HomeBackComponent } from './BackOffice/home-back/home-back.component';
import { ExerciseListComponent } from './components/exercise-list/exercise-list.component';
import { ExerciseDetailComponent } from './components/exercise-detail/exercise-detail.component';
const routes: Routes = [
  {
    path: "",
    component: AllTemplateFrontComponent,
    children: [
      { path: "", component: HomeFrontComponent }
    ]
  },
  {
    path: "admin",
    component: AllTemplateBackComponent,
    children: [
      { path: "", component: HomeBackComponent },
      { path: "exercises", component: ExerciseListComponent },
      { path: "exerciseDetail/:id", component: ExerciseDetailComponent },

     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
