
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { UpdateVideoAnalysisComponent } from './FrontOffice/VideoAnalysis/update-video-analysis/update-video-analysis.component';
import { AllTemplateFrontComponent } from './FrontOffice/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffice/all-template-back/all-template-back.component';
import { HomeFrontComponent } from './FrontOffice/home-front/home-front.component';
import { HomeBackComponent } from './BackOffice/home-back/home-back.component';
import { AddVideoAnalysisComponent } from './FrontOffice/VideoAnalysis/add-video-analysis/add-video-analysis.component';
import { GetAllVideoAnalysisComponent } from './FrontOffice/VideoAnalysis/get-all-video-analysis/get-all-video-analysis.component';
import { GetVideoAnalysisByIdComponent } from './FrontOffice/VideoAnalysis/get-video-analysis-by-id/get-video-analysis-by-id.component';
import { CreatePostComponent } from './FrontOffice/Blog/create-post/create-post.component';
import { AddVideoStatisticsComponent } from './FrontOffice/VideoStatistics/add-video-statistics/add-video-statistics.component';
import { ViewAllPostComponent } from './FrontOffice/Blog/view-all-post/view-all-post.component';
import { ViewPostComponent } from './FrontOffice/Blog/view-post/view-post.component';
import { GetAllVideoStatisticsComponent } from './FrontOffice/VideoStatistics/get-all-video-statistics/get-all-video-statistics.component';
import { GetVideoStatisticsByIdComponent } from './FrontOffice/VideoStatistics/get-video-statistics-by-id/get-video-statistics-by-id.component';
import { UpdatePostComponent } from './FrontOffice/Blog/update-post/update-post.component';
import { MedicalReportComponent } from './FrontOffice/medical-report/medical-report.component';
import { MedicalReportFormComponent } from './FrontOffice/medical-report-form/medical-report-form.component';
import { RecoveryRegimeFormComponent } from './FrontOffice/recovery-regime-form/recovery-regime-form.component';
import { RecoveryRegimeComponent } from './FrontOffice/recovery-regime/recovery-regime.component';
import { RegimeDetailComponent } from './FrontOffice/regime-detail/regime-detail.component';
import { ReportDetailComponent } from './FrontOffice/report-detail/report-detail.component';
import { PerformanceFormComponent } from './FrontOffice/performance-form/performance-form.component';
import { PerformanceDashboardComponent } from './FrontOffice/performance-dashboard/performance-dashboard.component';
import { SimulationViewerComponent } from './FrontOffice/simulation-viewer/simulation-viewer.component';
import { RecoveryCalendarComponent } from './FrontOffice/recovery-calendar/recovery-calendar.component';
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
      {path:"matches", component: AllTemplateFrontComponent,canActivate: [AuthGuard]},
      {path:"addVideoAnalysis", component: AddVideoAnalysisComponent,canActivate: [AuthGuard]},
      {path:"getAllVideoAnalysis", component: GetAllVideoAnalysisComponent,canActivate: [AuthGuard]},
      {path:"getVideoAnalysisById/:id", component: GetVideoAnalysisByIdComponent,
        children:[
          {path:"addvideostatistics", component: AddVideoStatisticsComponent},
          ],canActivate: [AuthGuard]},
      {path:"updateVideoAnalysis/:id", component: UpdateVideoAnalysisComponent,canActivate: [AuthGuard]},
      {path:"createPost", component: CreatePostComponent,canActivate: [AuthGuard]},
      {path:"addvideostatistics", component: AddVideoStatisticsComponent,canActivate: [AuthGuard]},
      {path:"viewallpost", component: ViewAllPostComponent,canActivate: [AuthGuard]},
      {path:"viewpost/:id", component: ViewPostComponent,canActivate: [AuthGuard]},
      {path:"getAllVideoStatistics", component: GetAllVideoStatisticsComponent,canActivate: [AuthGuard]},
      {path:"getVideoStatisticsById/:id", component: GetVideoStatisticsByIdComponent,canActivate: [AuthGuard]},
      {path:"UpdatePost/:id", component: UpdatePostComponent,canActivate: [AuthGuard]},

      {
        path:"report", component: MedicalReportComponent,canActivate: [AuthGuard]
      },
      {
        path:"Addreport", component: MedicalReportFormComponent,canActivate: [AuthGuard]
      },
      {
        path:"Addregime/:healthId", component: RecoveryRegimeFormComponent,canActivate: [AuthGuard]
      },
      {
        path:"Addregime", component: RecoveryRegimeFormComponent,canActivate: [AuthGuard]
      },

      {
        path:"regime", component: RecoveryRegimeComponent,canActivate: [AuthGuard]
      },
      { path: 'regimeDetail/:id', component: RegimeDetailComponent ,canActivate: [AuthGuard]},
      { path: 'reportDetail/:id', component: ReportDetailComponent ,canActivate: [AuthGuard]},
      {
        path:"AddPerformance/:playerId", component: PerformanceFormComponent,canActivate: [AuthGuard]
      },
      {
        path:"AddPerformance", component: PerformanceFormComponent,canActivate: [AuthGuard]
      },
      {
        path:"DashboardPerformance/:playerId", component: PerformanceDashboardComponent,canActivate: [AuthGuard]
      },

      { path: 'simulation', component: SimulationViewerComponent ,canActivate: [AuthGuard]},
      { path: 'calender', component: RecoveryCalendarComponent ,canActivate: [AuthGuard]},

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
