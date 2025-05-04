import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllTemplateFrontComponent } from './FrontOffice/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffice/all-template-back/all-template-back.component';
import { HomeFrontComponent } from './FrontOffice/home-front/home-front.component';
import { HomeBackComponent } from './BackOffice/home-back/home-back.component';
import { ExerciseComponent } from './FrontOffice/module/exercises/exercise/exercise.component';
import { TrainingSessionService } from './FrontOffice/module/TrainingSession/service/training-session.service';
import { TrainingSessionsComponent } from './FrontOffice/module/TrainingSession/training-session/training-session.component';
import { CalendarComponent } from './FrontOffice/module/calendar/calendar.component';

const routes: Routes = [
  {
    path:"", 
    component: AllTemplateFrontComponent,
    children:[
      
      {
        path:"exercises",
        component: ExerciseComponent
      },
      {
        path:"training-sessions",
        component: TrainingSessionsComponent
      },
      {path:"matches", component: AllTemplateFrontComponent},
     {
        path: "calendar",
        component: CalendarComponent
  }
      
    ]
  },
  {
    path:"admin",
    component: AllTemplateBackComponent,
    children:[
      {
        path:"",
        component: HomeBackComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }