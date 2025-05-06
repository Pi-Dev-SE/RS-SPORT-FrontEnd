import { ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ExerciseService } from '../../exercises/service/exercise-service.service';
import { TrainingSessionService } from '../service/training-session.service';
import { Exercise } from '../../exercises/model/exercise';
import { Coach } from '../model/coach.model';
import { WeatherData } from '../model/weatherData';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService
import { forkJoin, map } from 'rxjs';

enum SessionStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled'
}

interface Session {
  id?: number;
  sessionId?: number;
  startDate: Date | string;
  endDate: Date | string;
  time: string;
  objective: string;
  sessionStatus: SessionStatus;
  playerAvailability: string;
  coach?: Coach;
  exercises?: Exercise[];
  city: string;
}

@Component({
  selector: 'app-training-sessions',
  templateUrl: './training-session.component.html',
  styleUrls: ['./training-session.component.css']
})
export class TrainingSessionsComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChart?: BaseChartDirective;
  @ViewChild('doughnutChart') doughnutChart?: BaseChartDirective;
  @ViewChild('coachPerformanceReport', { static: false }) coachPerformanceReportElement!: ElementRef; // Fix ViewChild reference

  sessions: Session[] = [];
  sessionProgressMap: { [key: number]: { progress: number, status: string } } = {};
  exercises: Exercise[] = [];
  coaches: Coach[] = [];
  selectedSession: Session | null = null;
  currentSessionForCriteria: Session | null = null;
  sessionForm: FormGroup;
  assignCriteriaForm: FormGroup;
  analyzeCoachForm: FormGroup;
  showCreateModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  showAssignExercisesModal = false;
  showAssignCriteriaModal = false;
  showExercisesModal = false;
  showGeneratePlanModal = false;
  showAnalyzeCoachModal = false;
  showImageModal = false;
  selectedImageUrl: string | null = null;
  selectedExercises: Exercise[] = [];
  availableExerciseTypes: string[] = ['PHYSICAL', 'TECHNICAL', 'TACTICAL', 'CONDITIONING'];
  selectedExerciseTypes: string[] = [];
  barChartDataArray: any[] = []; // Data for ngx-charts
  pieChartData: any[] = [];
  chartData: any[] = [];
  progressionChartData: any[] = [];
  isLoading = false;
  isLoadingExercises = false;
  weatherData: WeatherData | null = null;
  isLoadingWeather = false;

  weatherChartData: ChartData<'bar'> = {
    labels: ['Temperature'],
    datasets: [
      {
        label: 'Weather Data',
        data: [],
        backgroundColor: ['#4299e1']
      }
    ]
  };
  sortField = 'startDate';
  sortDirection = 'asc';
  errorMessage: string | null = null;
  performanceReport: string | null = null;
  generatingPlan = false;
  analyzing: boolean = false;
  showLabels: boolean = true;
  showLegend: boolean = true;
  showGeneratePlanWizard = false;
  sessionDate = 'Apr 8, 2025';


  barChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };
  lineChartData: ChartData<'line'> = {
    datasets: [],
    labels: []
  };
  doughnutChartData: ChartData<'doughnut'> = {
    datasets: [],
    labels: ['Complétés', 'Non complétés']
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Durée (minutes)' } }
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Répartition des durées par type d\'exercice' }
    }
  };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Évolution du taux de complétion par semaine' }
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Taux de complétion (%)' } }
    }
  };
  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Taux de complétion global' }
    }
  };
  // Color scheme for ngx-charts
  colorScheme: any = {
    domain: ['#38a169', '#e2e8f0', '#4299e1', '#A10A28']
  };
selectedCoachName: any;
totalSessions: any;
completedExercises: any;
totalExercises: any;
overallCompletionRate: any;
exerciseTypeDistribution: any;
exerciseTypeCompletion: any;
recommendations: any;
completedSessions: any;

  analyzeForm: FormGroup; // Define analyzeForm
  today: Date = new Date(); // Add today property to store the current date

  constructor(
    private sessionService: TrainingSessionService,
    private exerciseService: ExerciseService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService // Inject ToastrService
  ) {
    this.analyzeForm = this.fb.group({ // Initialize analyzeForm
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
    this.sessionForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      time: ['', Validators.required],
      objective: ['', Validators.required],
      status: ['Scheduled', Validators.required],
      playerAvailability: ['', Validators.required],
      city: ['', Validators.required]
    });

    this.assignCriteriaForm = this.fb.group({
      targetObjective: ['', Validators.required],
      maxDuration: ['', Validators.required],
      coachId: ['', Validators.required],
      maxExercises: [5, [Validators.required, Validators.min(1)]],
    });

    this.analyzeCoachForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSessions();
    this.loadExercises();
    this.loadCoaches();
    this.loadSessionsProgress();
    this.sessionService.getAllSessions().subscribe(sessions => {
      this.sessions = sessions;
      this.sessions.forEach(session => {
        this.calculateSessionProgress(session);
      });
    });
    this.chartData = [
      { name: 'Session 1', value: 75 },
      { name: 'Session 2', value: 40 },
    ];

    
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  resetCharts(): void {
    this.barChartData = {
      labels: ['Sessions'],
      datasets: [
        { data: [0], label: 'Total', backgroundColor: '#4299e1' },
        { data: [0], label: 'Complétées', backgroundColor: '#38a169' }
      ]
    };

    this.doughnutChartData = {
      labels: ['Complétées', 'Restantes'],
      datasets: [
        { data: [0, 100], backgroundColor: ['#38a169', '#e2e8f0'] }
      ]
    };
  }

  private updateCharts(): void {
    const attemptChartUpdate = (attempts = 5, delay = 300) => {
      if (attempts <= 0) {
        console.error('Failed to initialize charts after multiple attempts.');
        return;
      }

      if (
        this.barChart &&
        this.barChart.chart &&
        this.doughnutChart &&
        this.doughnutChart.chart
      ) {
        this.barChart.chart.update();
        this.doughnutChart.chart.update();
      } else {
        console.warn('Charts not initialized yet. Retrying...');
        setTimeout(() => {
          this.cdr.detectChanges();
          attemptChartUpdate(attempts - 1, delay);
        }, delay);
      }
    };

    attemptChartUpdate();
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bi-calendar-check';
      case 'in progress':
        return 'bi-hourglass-split';
      case 'completed':
        return 'bi-check-circle';
      case 'canceled':
        return 'bi-x-circle';
      default:
        return 'bi-question-circle';
    }
  }

  loadSessions(): void {
    this.isLoading = true;
    this.sessionService.getAllSessions().subscribe({
      next: (data: Session[]) => {
        console.log('Loaded sessions:', data);
        this.sessions = data.map(session => ({ ...session, exercises: session.exercises || [] }));
        this.sessions.forEach(session => {
          this.sessionService.getExercisesForSession(session.id!).subscribe({
            next: (exercises: Exercise[]) => {
              session.exercises = exercises;
              this.cdr.detectChanges();
            },
            error: (error: HttpErrorResponse) => {
              console.error(`Error loading exercises for session ${session.id}:`, error.message);
              session.exercises = [];
            }
          });
        });
        this.sortSessions();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading sessions:', error.message);
        this.errorMessage = 'Erreur lors du chargement des sessions.';
        this.isLoading = false;
      }
    });
  }
  calculateSessionProgress(session: Session): void {
    const total = session.exercises?.length || 0;
    const completed = session.exercises?.filter(e => e.completed).length || 0;
  
    let progress = 0;
    let status = 'SCHEDULED';
  
    if (total > 0) {
      progress = (completed / total) * 100;
      if (progress === 100) status = 'COMPLETED';
      else if (progress > 0) status = 'IN_PROGRESS';
    }
  
    if (session.id !== undefined) {
      this.sessionProgressMap[session.id] = { progress, status };
    } else {
      console.error('Session ID is undefined. Cannot calculate progress.');
    }
  }
  loadSessionsProgress(): void {
    this.sessionService.getAllSessions().subscribe(sessions => {
      const progressRequests = sessions.map(session =>
        this.sessionService.getSessionProgress(session.id).pipe(
          map(progressData => ({
            name: session.name,
            value: +progressData.toFixed(1) // Progress rounded
          }))
        )
      );
  
      forkJoin(progressRequests).subscribe(results => {
        this.chartData = results;
      });
    });
  }
  loadExercises(): void {
    this.isLoadingExercises = true;
    this.exerciseService.getAllExercises().subscribe({
      next: (data: Exercise[]) => {
        console.log('Loaded exercises:', data);
        this.exercises = data;
        this.isLoadingExercises = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading exercises:', error.message);
        this.errorMessage = 'Erreur lors du chargement des exercices.';
        this.isLoadingExercises = false;
      }
    });
  }

  loadCoaches(): void {
    this.sessionService.getAllCoaches().subscribe({
      next: (data: Coach[]) => {
        console.log('Loaded coaches:', data);
        this.coaches = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading coaches:', error.message);
        this.errorMessage = 'Erreur lors du chargement des coachs.';
      }
    });
  }

  viewSessionDetails(session: Session): void {
    console.log('Viewing session details:', session);
    this.selectedSession = session;
    if (!session.exercises) {
      this.sessionService.getExercisesForSession(session.id!).subscribe({
        next: (exercises: Exercise[]) => {
          console.log('Exercises loaded for session:', exercises);
          this.selectedSession!.exercises = exercises;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading exercises for session:', error.message);
          this.selectedSession!.exercises = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('Exercises already loaded:', session.exercises);
    }
  }
  getSessionProgress(sessionId: number): number {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session introuvable');
    }

    const totalExercises = (session.exercises ?? []).length;
    if (totalExercises === 0) {
      session.sessionStatus = SessionStatus.SCHEDULED;
      return 0.0;
    }

    const completedExercises = (session.exercises ?? []).filter(exercise => exercise.completed).length;
    const progress = (completedExercises / totalExercises) * 100;

    if (progress === 0) {
      session.sessionStatus = SessionStatus.SCHEDULED;
    } else if (progress > 0 && progress < 100) {
      session.sessionStatus = SessionStatus.IN_PROGRESS;
    } else if (progress === 100) {
      session.sessionStatus = SessionStatus.COMPLETED;
    }

    return progress;
  }
  openCreateModal(): void {
    this.sessionForm.reset({ status: 'Scheduled' });
    this.showCreateModal = true;
    this.weatherData = null;
    this.errorMessage = null;
  }

  openUpdateModal(session: Session): void {
    this.selectedSession = session;
    this.sessionForm.patchValue({
      startDate: new Date(session.startDate).toISOString().split('T')[0],
      endDate: new Date(session.endDate).toISOString().split('T')[0],
      time: session.time,
      objective: session.objective,
      status: session.sessionStatus,
      playerAvailability: session.playerAvailability,
      coachId: session.coach?.id
    });
    this.showUpdateModal = true;
    this.weatherData = null;
    this.errorMessage = null;
  }

  openDeleteModal(session: Session): void {
    this.selectedSession = session;
    this.showDeleteModal = true;
  }

  openAssignExercisesModal(session: Session): void {
    this.selectedSession = session;
    this.selectedExercises = session.exercises || [];
    this.showAssignExercisesModal = true;
  }

  openAssignCriteriaModal(session: Session): void {
    console.log('Opening assign criteria modal for session:', session);
    try {
      this.assignCriteriaForm.patchValue({
        coachId: session.coach?.id || '',
        targetObjective: session.objective || ''
      });
      this.selectedExerciseTypes = [];
      this.showAssignCriteriaModal = true;
      this.currentSessionForCriteria = session;
    } catch (error) {
      console.error('Error in openAssignCriteriaModal:', error);
      this.errorMessage = 'Erreur lors de l’ouverture de la modale d’assignation par critères.';
    }
  }

  openExercisesModal(session: Session): void {
    this.selectedSession = session;
    this.showExercisesModal = true;
  }

  openGeneratePlanModal(session: Session): void {
    this.selectedSession = session;
    this.showGeneratePlanModal = true;
  }

  openAnalyzeCoachModal(): void {
    this.analyzeCoachForm.reset();
    this.showAnalyzeCoachModal = true;
    this.performanceReport = null;
    this.errorMessage = null;
    this.barChartDataArray = []; // Reset chart data
    this.pieChartData = [];
    this.progressionChartData = [];
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showUpdateModal = false;
    this.showDeleteModal = false;
    this.showAssignExercisesModal = false;
    this.showAssignCriteriaModal = false;
    this.showExercisesModal = false;
    this.showGeneratePlanModal = false;
    this.showAnalyzeCoachModal = false;
    this.showImageModal = false;
    this.selectedImageUrl = null;
    this.selectedSession = null;
    this.currentSessionForCriteria = null;
    this.selectedExercises = [];
    this.performanceReport = null;
    this.errorMessage = null;
  }

  openImageModal(imageUrl: string): void {
    this.selectedImageUrl = imageUrl;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.selectedImageUrl = null;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const parent = imgElement.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'no-image-placeholder';
      placeholder.style.width = '50px';
      placeholder.style.height = '50px';
      placeholder.style.backgroundColor = '#f0f0f0';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.fontSize = '12px';
      placeholder.style.color = '#888';
      placeholder.innerText = 'Pas d\'image';
      parent.appendChild(placeholder);
    }
  }

  checkWeather(): void {
    if (this.sessionForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      return;
    }

    this.isLoadingWeather = true;
    this.errorMessage = null;
    const { city, startDate } = this.sessionForm.value;
    this.sessionService.checkWeatherBeforeCreatingSession(city, startDate).subscribe({
      next: (weatherData: WeatherData) => {
        this.weatherData = weatherData;
        this.weatherChartData.datasets[0].data = [weatherData.temperature];
        this.isLoadingWeather = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Erreur lors de la vérification de la météo : ' + error.message;
        this.isLoadingWeather = false;
      }
    });
  }

  createSession(): void {
    if (this.sessionForm.valid) {
      const formValues = this.sessionForm.value;
      const newSession: Session = {
        startDate: new Date(formValues.startDate),
        endDate: new Date(formValues.endDate),
        time: formValues.time,
        objective: formValues.objective,
        sessionStatus: formValues.status,
        playerAvailability: formValues.playerAvailability,
        city: formValues.city
      };
  
      this.sessionService.createSession(newSession).subscribe({
        next: () => {
          this.loadSessions();
          this.closeModals();
          this.toastr.success('Session créée avec succès !');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors de la création de la session :', error.message);
          this.errorMessage = 'Erreur lors de la création de la session.';
          this.toastr.error('Erreur lors de la création de la session.');
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      this.toastr.error('Veuillez remplir tous les champs requis.');
    }
  }
    updateSession(): void {
    if (this.sessionForm.valid && this.selectedSession) {
      const formValues = this.sessionForm.value;
      const updatedSession: Session = {
        id: this.selectedSession.id,
        startDate: new Date(formValues.startDate),
        endDate: new Date(formValues.endDate),
        time: formValues.time,
        objective: formValues.objective,
        sessionStatus: formValues.status,
        playerAvailability: formValues.playerAvailability,
        city: formValues.city,
        coach: undefined
      };

      this.sessionService.updateSession(updatedSession.id!, { ...updatedSession, coachId: formValues.coachId }).subscribe({
        next: () => {
          this.loadSessions();
          this.closeModals();
          this.toastr.success('Session mise à jour avec succès !');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating session:', error.message);
          this.errorMessage = 'Erreur lors de la mise à jour de la session.';
          this.toastr.error('Erreur lors de la mise à jour de la session.');
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      this.toastr.error('Veuillez remplir tous les champs requis.');
    }
  }

  deleteSession(): void {
    if (this.selectedSession) {
      this.sessionService.deleteSession(this.selectedSession.id!).subscribe({
        next: () => {
          this.loadSessions();
          this.closeModals();
          this.toastr.success('Session supprimée avec succès !');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting session:', error.message);
          this.errorMessage = 'Erreur lors de la suppression de la session.';
          this.toastr.error('Erreur lors de la suppression de la session.');
        }
      });
    }
  }

  toggleExerciseSelection(exercise: Exercise): void {
    const index = this.selectedExercises.findIndex(e => e.id === exercise.id);
    if (index > -1) {
      this.selectedExercises.splice(index, 1);
    } else {
      this.selectedExercises.push(exercise);
    }
  }

  isExerciseSelected(exercise: Exercise): boolean {
    return this.selectedExercises.some(e => e.id === exercise.id);
  }

  assignExercises(): void {
    if (this.selectedSession) {
      this.sessionService.addExercisesToSession(this.selectedSession.id!, this.selectedExercises).subscribe({
        next: () => {
          this.loadSessions();
          this.closeModals();
          this.toastr.success('Exercices assignés avec succès !');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error assigning exercises:', error.message);
          this.errorMessage = 'Erreur lors de l’assignation des exercices.';
          this.toastr.error('Erreur lors de l’assignation des exercices.');
        }
      });
    }
  }

  toggleExerciseType(type: string): void {
    const index = this.selectedExerciseTypes.indexOf(type);
    if (index === -1) {
      this.selectedExerciseTypes.push(type);
    } else {
      this.selectedExerciseTypes.splice(index, 1);
    }
  }

  assignExercisesToSession(): void {
    if (this.assignCriteriaForm.valid && this.currentSessionForCriteria) {
      const formValues = this.assignCriteriaForm.value;
      const coachId = parseInt(formValues.coachId, 10);
      const maxDuration = formValues.maxDuration.replace(/\s*min$/, '');

      let targetObjective = formValues.targetObjective.trim();
      if (!/^[a-zA-Z0-9\s]+$/.test(targetObjective)) {
        this.errorMessage = 'L’objectif cible ne doit contenir que des lettres, des chiffres et des espaces.';
        this.toastr.error('L’objectif cible ne doit contenir que des lettres, des chiffres et des espaces.');
        return;
      }

      this.sessionService.assignExercisesToSession(
        this.currentSessionForCriteria.id!,
        targetObjective,
        maxDuration,
        this.selectedExerciseTypes,
        coachId,
        formValues.maxExercises
      ).subscribe({
        next: () => {
          this.loadSessions();
          this.closeModals();
          this.toastr.success('Exercices assignés avec succès !');
        },
        error: (error: any) => {
          console.error('Error assigning exercises based on criteria:', error);
          let errorMessage = 'Une erreur est survenue.';
          if (error.status === 500) {
            errorMessage = 'Erreur serveur : le serveur a rencontré un problème.';
          } else if (error.status === 400) {
            errorMessage = 'Erreur : les paramètres envoyés sont incorrects.';
          }
          this.errorMessage = errorMessage;
          this.toastr.error(errorMessage);
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis.';
      this.toastr.error('Veuillez remplir tous les champs requis.');
    }
  }

  toggleExerciseCompletion(exercise: Exercise): void {
    const newCompletedState = !exercise.completed;
    this.exerciseService.markExerciseAsCompleted(Number(exercise.id), newCompletedState).subscribe({
      next: (updatedExercise) => {
        exercise.completed = updatedExercise.completed;
        if (this.selectedSession) {
          this.sessionService.getSessionProgress(this.selectedSession.id!).subscribe(progress => {
            console.log(`Session progress updated: ${progress}%`);
          });
        }
        this.toastr.success('État de l’exercice mis à jour avec succès !');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating exercise completion:', error.message);
        this.errorMessage = 'Erreur lors de la mise à jour de l’état de l’exercice.';
        this.toastr.error('Erreur lors de la mise à jour de l’état de l’exercice.');
      }
    });
  }

  sortSessions(): void {
    this.sessions.sort((a, b) => {
      let comparison = 0;
      if (this.sortField === 'startDate') {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (this.sortField === 'status') {
        comparison = a.sessionStatus.localeCompare(b.sessionStatus);
      } else if (this.sortField === 'objective') {
        comparison = a.objective.localeCompare(b.objective);
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  setSortField(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortSessions();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'sort';
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  analyzePerformance(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.performanceReport = null;

    const startDate = this.analyzeForm.get('startDate')?.value;
    const endDate = this.analyzeForm.get('endDate')?.value;

    if (!startDate || !endDate) {
      this.errorMessage = 'Veuillez remplir tous les champs du formulaire.';
      this.toastr.error('Veuillez remplir tous les champs du formulaire.');
      this.isLoading = false;
      return;
    }

    this.sessionService.analyzePerformance(startDate, endDate).subscribe({
      next: (report) => {
        this.performanceReport = report;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error || 'Erreur lors de l\'analyse des performances.';
        this.toastr.error(this.errorMessage || 'An unknown error occurred.');
        this.isLoading = false;
      }
    });
  }

  calculateProgressionStats(sessions: Session[]): { trend: string; chartData: any[] } {
    if (!sessions || sessions.length === 0) {
      return { trend: 'No data available', chartData: [] };
    }

    // Sort sessions by date
    const sortedSessions = sessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const chartData: any[] = [];
    let trend = 'Stable';

    sortedSessions.forEach((session, index) => {
      const date = new Date(session.startDate).toLocaleDateString();
      const isCompleted = session.sessionStatus.toLowerCase() === 'completed' ? 1 : 0;
      chartData.push({ name: date, value: isCompleted });
      if (index > 0) {
        if (chartData[index].value > chartData[index - 1].value) trend = 'Improving';
        else if (chartData[index].value < chartData[index - 1].value) trend = 'Declining';
      }
    });

    return { trend, chartData };
  }

  downloadReportAsPDF(): void {
    if (!this.performanceReport) {
      this.errorMessage = "Aucun rapport à exporter.";
      return;
    }
  
    const pdf = new jsPDF('p', 'mm', 'a4');
    const lineHeight = 7;
    const marginLeft = 20;
    let y = 25;
  
    // Logo & Titre
    pdf.addImage('assets/FrontOffice/images/logo.png', 'PNG', 10, 10, 20, 20);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance Report', 105, 20, { align: 'center' });
  
    y += 20;
    pdf.setLineWidth(0.5);
    pdf.line(15, y, 195, y);
    y += 10;
  
    // Date
    const generatedDate = new Date().toLocaleDateString('fr-FR');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le : ${generatedDate}`, 140, y);
    y += 10;
  
    // Contenu du rapport (texte brut contenu dans performanceReport)
    const textLines = pdf.splitTextToSize(this.performanceReport, 170); // max width: 170mm
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(33, 37, 41); // Couleur texte sombre
  
    for (let i = 0; i < textLines.length; i++) {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(textLines[i], marginLeft, y);
      y += lineHeight;
    }
  
    // Signature
    if (y + 30 > 280) {
      pdf.addPage();
      y = 20;
    }
  
    y += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Préparé par :', marginLeft, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text('IS Sports Team', marginLeft, y + 7);
  
    // Footer
    pdf.setFontSize(8);
    pdf.text(`Page 1/1 | Ref: REP-2025-01`, 105, 285, { align: 'center' });
  
    // Téléchargement
    const filename = `rapport-performances-${this.today.toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  }
}
  