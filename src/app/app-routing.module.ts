import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllTemplateFrontComponent } from './FrontOffice/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffice/all-template-back/all-template-back.component';
import { HomeFrontComponent } from './FrontOffice/home-front/home-front.component';
import { HomeBackComponent } from './BackOffice/home-back/home-back.component';
import { TacticComponent } from './FrontOffice/tactic/tactic.component';
import { LoginComponent } from './chat/auth/components/login/login.component';

const routes: Routes = [
  {
    path:"",
    component: AllTemplateFrontComponent,
    children:[
      {
        path:"",
        component: HomeFrontComponent

      },
      {
        path: "tacticsboard",
        component: TacticComponent
      },

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
  },
   {
     path: 'chat',
     title: 'Chat App',
     loadChildren: () => import('./chat/features/user/user.module').then(m => m.UserModule)
   },
   {
     path: 'login',
     title: 'Login',
     component: LoginComponent
   }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
