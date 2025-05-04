import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { MatchesComponent } from './FrontOffice/matches/matches.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';

@NgModule({
  imports: [
    AccordionModule.forRoot()
  ]
})
export class BootstrapModule {}
import { CommonModule } from '@angular/common';
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
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GenerateTrainingPlanWizardComponent } from './generate-training-plan-wizard/generate-training-plan-wizard.component';
import { ExerciseComponent } from './FrontOffice/module/exercises/exercise/exercise.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarComponent } from './FrontOffice/module/calendar/calendar.component';
// Removed duplicate import of RouterModule

@NgModule({
  declarations: [
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
    CalendarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterModule,
    AccordionModule.forRoot(),
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
    MatListModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgxChartsModule,
    AppRoutingModule,
    FullCalendarModule,
    DragDropModule
  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
