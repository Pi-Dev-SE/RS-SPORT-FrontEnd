import { NgChartsModule } from 'ng2-charts';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AllTemplateFrontComponent } from './FrontOffice/all-template-front/all-template-front.component';
import { FooterFrontComponent } from './FrontOffice/footer-front/footer-front.component';
import { HeaderFrontComponent } from './FrontOffice/header-front/header-front.component';
import { AllTemplateBackComponent } from './BackOffice/all-template-back/all-template-back.component';
import { FooterBackComponent } from './BackOffice/footer-back/footer-back.component';
import { NavbarBackComponent } from './BackOffice/navbar-back/navbar-back.component';
import { SidebarBackComponent } from './BackOffice/sidebar-back/sidebar-back.component';
import { HomeFrontComponent } from './FrontOffice/home-front/home-front.component';
import { HomeBackComponent } from './BackOffice/home-back/home-back.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CreatExerciceComponent } from './FrontOffice/module/exercises/creat-exercice/creat-exercice.component';
import { ConfirmDialogComponent } from './FrontOffice/module/exercises/Component/confirm-dialog/confirm-dialog.component';
import { TrainingSessionsComponent } from './FrontOffice/module/TrainingSession/training-session/training-session.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GenerateTrainingPlanWizardComponent } from './generate-training-plan-wizard/generate-training-plan-wizard.component';
import { ExerciseComponent } from './FrontOffice/module/exercises/exercise/exercise.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarComponent } from './FrontOffice/module/calendar/calendar.component';
import { PrimengModule } from './chat/primeng/primeng.module';
import { TacticComponent } from './FrontOffice/tactic/tactic.component';
import { TacticsBackComponent } from './BackOffice/tactics-back/tactics-back.component';
import { SignInComponent } from './FrontOffice/sign-in/sign-in.component';
import { SignUpComponent } from './FrontOffice/sign-up/sign-up.component';
import { LogoutComponent } from './FrontOffice/logout/logout.component';

import { MatchesComponent } from './FrontOffice/matches/matches.component';
import { AddVideoAnalysisComponent } from './FrontOffice/VideoAnalysis/add-video-analysis/add-video-analysis.component';

import { GetAllVideoAnalysisComponent } from './FrontOffice/VideoAnalysis/get-all-video-analysis/get-all-video-analysis.component';
import { GetVideoAnalysisByIdComponent } from './FrontOffice/VideoAnalysis/get-video-analysis-by-id/get-video-analysis-by-id.component';
import { CreatePostComponent } from './FrontOffice/Blog/create-post/create-post.component';
import { UpdateVideoAnalysisComponent } from './FrontOffice/VideoAnalysis/update-video-analysis/update-video-analysis.component';
import { AddVideoStatisticsComponent } from './FrontOffice/VideoStatistics/add-video-statistics/add-video-statistics.component';
import { ViewAllPostComponent } from './FrontOffice/Blog/view-all-post/view-all-post.component';
import { ViewPostComponent } from './FrontOffice/Blog/view-post/view-post.component';
import { GetAllVideoStatisticsComponent } from './FrontOffice/VideoStatistics/get-all-video-statistics/get-all-video-statistics.component';
import { GetVideoStatisticsByIdComponent } from './FrontOffice/VideoStatistics/get-video-statistics-by-id/get-video-statistics-by-id.component';
import { UpdatePostComponent } from './FrontOffice/Blog/update-post/update-post.component';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { MedicalReportFormComponent } from './FrontOffice/medical-report-form/medical-report-form.component';
import { RecoveryRegimeFormComponent } from './FrontOffice/recovery-regime-form/recovery-regime-form.component';
import { MedicalReportComponent } from './FrontOffice/medical-report/medical-report.component';
import { RecoveryRegimeComponent } from './FrontOffice/recovery-regime/recovery-regime.component';
import { ReportDetailComponent } from './FrontOffice/report-detail/report-detail.component';
import { RegimeDetailComponent } from './FrontOffice/regime-detail/regime-detail.component';
import { PerformanceFormComponent } from './FrontOffice/performance-form/performance-form.component';
import { PerformanceDashboardComponent } from './FrontOffice/performance-dashboard/performance-dashboard.component';
import { SimulationViewerComponent } from './FrontOffice/simulation-viewer/simulation-viewer.component';
import { BodyPartLabelComponent } from './FrontOffice/body-part-label/body-part-label.component';
import { RecoveryCalendarComponent } from './FrontOffice/recovery-calendar/recovery-calendar.component';
import { ChatboxComponent } from './FrontOffice/chatbox/chatbox.component';
import { NgxPaginationModule } from 'ngx-pagination';

import { MedicalArchivesComponent } from './FrontOffice/medical-archives/medical-archives.component';
import { TeamFormComponent } from './FrontOffice/team-form/team-form.component';
import { TeamManagementComponent } from './FrontOffice/team-management/team-management.component';
import { TeamDetailComponent } from './FrontOffice/team-detail/team-detail.component';
import { TeamComponent } from './FrontOffice/team/team.component';

const FullCalendarPlugins = [ // define plugins array
  dayGridPlugin
];


const toastrModule = ToastrModule.forRoot();

@NgModule({
  declarations: [ // ✅ Move components here
    AppComponent,
    AllTemplateFrontComponent,
    FooterFrontComponent,
    HeaderFrontComponent,
    AllTemplateBackComponent,
    FooterBackComponent,
    NavbarBackComponent,
    SidebarBackComponent,
    HomeFrontComponent,
    HomeBackComponent,
    MatchesComponent,
    ConfirmDialogComponent,
    GenerateTrainingPlanWizardComponent,
    TrainingSessionsComponent,
    ExerciseComponent,
    CalendarComponent,
    TacticsBackComponent,
    SignInComponent,
    SignUpComponent,
    LogoutComponent,
    MatchesComponent,
    AddVideoAnalysisComponent,
    GetAllVideoAnalysisComponent,
    GetVideoAnalysisByIdComponent,
    CreatePostComponent,
    UpdateVideoAnalysisComponent,
    AddVideoStatisticsComponent,
    ViewAllPostComponent,
    ViewPostComponent,
    GetAllVideoStatisticsComponent,
    GetVideoStatisticsByIdComponent,
    UpdatePostComponent,
    MedicalReportFormComponent,
    RecoveryRegimeFormComponent,
    MedicalReportComponent,
    RecoveryRegimeComponent,
    ReportDetailComponent,
    RegimeDetailComponent,
    PerformanceFormComponent,
    PerformanceDashboardComponent,
    SimulationViewerComponent,
    BodyPartLabelComponent,
    ChatboxComponent,
    RecoveryCalendarComponent,
    MedicalArchivesComponent,
    TeamFormComponent,
    TeamManagementComponent,
    TeamDetailComponent,
    TeamComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterModule,
    AccordionModule,
    AppRoutingModule,
    HttpClientModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatChipsModule,
    toastrModule,
    BrowserAnimationsModule,
    FullCalendarModule,
    DragDropModule,
    PrimengModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    NgxPaginationModule,
    CommonModule,
    NgChartsModule


  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    DatePipe
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
