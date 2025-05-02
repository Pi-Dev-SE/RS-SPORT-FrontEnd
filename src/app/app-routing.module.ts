import { UpdateVideoAnalysisComponent } from './FrontOffice/VideoAnalysis/update-video-analysis/update-video-analysis.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
const routes: Routes = [
  {path:"",component: AllTemplateFrontComponent,
    children:[
      {
        path:"",
        component: HomeFrontComponent
      },
      {path:"matches", component: AllTemplateFrontComponent},
      {path:"addVideoAnalysis", component: AddVideoAnalysisComponent},
      {path:"getAllVideoAnalysis", component: GetAllVideoAnalysisComponent},
      {path:"getVideoAnalysisById/:id", component: GetVideoAnalysisByIdComponent,
        children:[
          {path:"addvideostatistics", component: AddVideoStatisticsComponent},
          ]},
      {path:"updateVideoAnalysis/:id", component: UpdateVideoAnalysisComponent},
      {path:"createPost", component: CreatePostComponent},
      {path:"addvideostatistics", component: AddVideoStatisticsComponent},
      {path:"viewallpost", component: ViewAllPostComponent},
      {path:"viewpost/:id", component: ViewPostComponent},
      {path:"getAllVideoStatistics", component: GetAllVideoStatisticsComponent},
      {path:"getVideoStatisticsById/:id", component: GetVideoStatisticsByIdComponent},
      {path:"UpdatePost/:id", component: UpdatePostComponent},

      {
        path:"report", component: MedicalReportComponent
      },
      {
        path:"Addreport", component: MedicalReportFormComponent
      },
      {
        path:"Addregime/:healthId", component: RecoveryRegimeFormComponent
      },
      {
        path:"Addregime", component: RecoveryRegimeFormComponent
      },

      {
        path:"regime", component: RecoveryRegimeComponent
      },
      { path: 'regimeDetail/:id', component: RegimeDetailComponent },
      { path: 'reportDetail/:id', component: ReportDetailComponent },
      {
        path:"AddPerformance/:playerId", component: PerformanceFormComponent
      },
      {
        path:"AddPerformance", component: PerformanceFormComponent
      },
      {
        path:"DashboardPerformance/:playerId", component: PerformanceDashboardComponent
      },

      { path: 'simulation', component: SimulationViewerComponent },
      { path: 'calender', component: RecoveryCalendarComponent },


    ]
  },

  {
    path:"admin",component: AllTemplateBackComponent,
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
