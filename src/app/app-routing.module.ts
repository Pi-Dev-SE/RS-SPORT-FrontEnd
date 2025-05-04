import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { AllTemplateFrontComponent } from './FrontOffice/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffice/all-template-back/all-template-back.component';
import { HomeFrontComponent } from './FrontOffice/home-front/home-front.component';
import { HomeBackComponent } from './BackOffice/home-back/home-back.component';
import { TacticComponent } from './FrontOffice/tactic/tactic.component';
import { TacticsBackComponent } from './BackOffice/tactics-back/tactics-back.component';
import { SignInComponent } from './FrontOffice/sign-in/sign-in.component';
import { SignUpComponent } from './FrontOffice/sign-up/sign-up.component';
import { LogoutComponent } from './FrontOffice/logout/logout.component';

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
        path:"signin",
        component: SignInComponent
      },
      {
        path:"signup",
        component: SignUpComponent
      },
      {
        path:"logout",
        component: LogoutComponent
      },
      {
        path: "tacticsboard",
        component: TacticComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'chat',
        loadChildren: () => import('./chat/features/user/user.module').then(m => m.UserModule),
        canActivate: [AuthGuard]
      },

    ]
  },
  {
    path:"admin",
    component: AllTemplateBackComponent,
    canActivate: [AuthGuard],
    children:[
      {
        path:"",
        component: HomeBackComponent
      },
      {
        path:"tactics",
        component: TacticsBackComponent
      }
    ]
  },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
