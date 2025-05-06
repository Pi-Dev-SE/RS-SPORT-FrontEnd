import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Exercise, ExerciseType, Visibility } from '../model/exercise';
import { MatDialog } from '@angular/material/dialog';
import { ExerciseService } from '../service/exercise-service.service';
import { ConfirmDialogComponent } from '../Component/confirm-dialog/confirm-dialog.component';
import { CreatExerciceComponent } from '../creat-exercice/creat-exercice.component';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PageResponse } from '../model/PageResponse';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.css'],
})
export class ExerciseComponent implements OnInit {
  exercises: Exercise[] = [];
  totalPages: number = 0;
  currentPage: number = 0;
  pageSize: number = 3; // Nombre d'exercices par page
  itemsperpage: number = 3;
  filteredExercises: Exercise[] = [];
  loading = true;
  searchTerm = '';
  selectedType: string = 'ALL';
  selectedVisibility: string = 'ALL';
  coachId = 1;
  teamId = 1;
  exercise?: Exercise;
  stats: any = {};  // Objet pour stocker les statistiques



  exerciseTypes = [
    { value: 'ALL', label: 'All Types' },
    { value: ExerciseType.PHYSICAL, label: 'Physical' },
    { value: ExerciseType.CONDITIONING, label: 'Conditioning' },
    { value: ExerciseType.TACTICAL, label: 'Tactical' },
    { value: ExerciseType.TECHNICAL, label: 'Technical' }
  ];

  visibilityOptions = [
    { value: 'ALL', label: 'All Visibilities' },
    { value: Visibility.PUBLIC, label: 'Public' },
    { value: Visibility.PRIVATE, label: 'Private' }
  ];

  // CHART CONFIG
  barChartOptions: ChartOptions = {
    responsive: true,
  };
  barChartLabels: string[] = ['Physical', 'Conditioning', 'Tactical', 'Technical'];
  barChartType: ChartType = 'bar';
  barChartLegend = false;
  barChartData: ChartDataset[] = [{ data: [], label: 'Exercises' }];
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],     // Utilisation du plugin dayGrid
    events: [],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    eventClick: this.handleEventClick.bind(this)
  };
  route: any;
  router: any;
  constructor(
    private exerciseService: ExerciseService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCoachAndTeamId();
    this.loadExercises();
    
  }

  loadCoachAndTeamId(): void {
    this.coachId = Number(localStorage.getItem('coachId')) || 1;
    this.teamId = Number(localStorage.getItem('teamId')) || 1;
  }

  loadExercises(): void {
    this.exerciseService.getExercisesPaginated(this.currentPage, this.pageSize)
    .subscribe((data: PageResponse<Exercise>) => {
      this.exercises = data.content;
      this.totalPages = data.totalPages;
      this.currentPage = data.number;
    });
    this.loading = true;
    this.exerciseService.findAll().subscribe(
      (data) => {
        this.exercises = data;

        this.exercises.forEach(ex => {
          this.exerciseService.getAverageRating(ex.id!).subscribe(
            avg => ex.averageRating = avg,
            err => {
              console.error(`Erreur lors du chargement de la note moyenne pour l'exercice ${ex.id}`, err);
              ex.averageRating = 0;
            }
          );
        });

        this.applyFilters();
        this.updateChartData();
        this.loading = false;
      },
      (error) => {
        console.error('Error loading exercises', error);
        this.loading = false;
      }
    );
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadExercises();
    }
  }
  
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadExercises();
    }
  }
  
   addRating(exercise: Exercise, rating: number): void {
    exercise.tempRating = rating;
    this.exerciseService.addRatingToExercise(exercise.id, rating).subscribe({
      next: (response) => {
        exercise.averageRating = response.averageRating;
        this.loadAverageRating(exercise);
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout du rating', err);
        exercise.tempRating = undefined;
      }
    });
  }

  loadAverageRating(exercise: Exercise): void {
    this.exerciseService.getAverageRating(exercise.id).subscribe((rating) => {
      exercise.averageRating = rating;
    });
  }

  applyFilters(): void {
    this.filteredExercises = this.exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           exercise.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.selectedType === 'ALL' || exercise.exerciseType === this.selectedType;
      const matchesVisibility = this.selectedVisibility === 'ALL' || exercise.visibility === this.selectedVisibility;
      return matchesSearch && matchesType && matchesVisibility;
    });
  }

  search(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  filterByVisibility(visibility: string): void {
    this.selectedVisibility = visibility;
    this.applyFilters();
  }

  openExerciseDetail(exercise?: Exercise): void {
    const dialogRef = this.dialog.open(CreatExerciceComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: exercise || {
        name: '',
        exerciseType: ExerciseType.PHYSICAL,
        description: '',
        duration: '',
        objectif: '',
        image: '',
        videoUrl: '',
        visibility: Visibility.PRIVATE,
        creationDate: new Date().toISOString()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.updateExercise(result);
        } else {
          this.createExercise(result);
        }
      }
    });
  }

  createExercise(exercise: Exercise): void {
    this.exerciseService.createExercise(exercise, this.coachId, this.teamId).subscribe(
      (newExercise) => {
        // Ajoute l'exercice nouvellement créé à la liste existante
        this.exercises.unshift(newExercise); // Tu peux aussi choisir de recharger les exercices
        this.applyFilters();
  
        // Vérifie si le nombre d'exercices dépasse la limite de la page actuelle
        const newPage = Math.floor(this.exercises.length / this.pageSize);
        if (newPage > this.currentPage) {
          this.currentPage = newPage;
          this.router.navigate([`/exercise/page/${this.currentPage}`]); // Met à jour l'URL
        }
  
        this.loadExercises();
        this.updateChartData();
      },
      (error) => {
        console.error('Error creating exercise', error);
      }
    );
  }
  
  
  

  updateExercise(exercise: Exercise): void {
    this.exerciseService.update(exercise, Number(exercise.id)).subscribe(
      (updatedExercise) => {
        const index = this.exercises.findIndex(e => e.id === updatedExercise.id);
        if (index !== -1) {
          this.exercises[index] = updatedExercise;
          this.applyFilters();
          this.updateChartData();

        }
      },
      error => console.error('Error updating exercise', error)
    );
  }

  deleteExercise(exercise: Exercise): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete "${exercise.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exerciseService.delete(exercise.id.toString()).subscribe(
          () => {
            this.exercises = this.exercises.filter(e => e.id !== exercise.id);
            this.applyFilters();
            this.updateChartData();


          },
          error => console.error('Error deleting exercise', error)
        );
      }
    });
  }

  updateChartData(): void {
    const counts = {
      [ExerciseType.PHYSICAL]: 0,
      [ExerciseType.CONDITIONING]: 0,
      [ExerciseType.TACTICAL]: 0,
      [ExerciseType.TECHNICAL]: 0
    };

    this.exercises.forEach(ex => {
      if (counts.hasOwnProperty(ex.exerciseType)) {
        counts[ex.exerciseType]++;
      }
    });

    this.barChartData = [
      {
        data: [
          counts[ExerciseType.PHYSICAL],
          counts[ExerciseType.CONDITIONING],
          counts[ExerciseType.TACTICAL],
          counts[ExerciseType.TECHNICAL]
        ],
        label: 'Exercises'
      }
    ];
  }
  
  handleEventClick(info: any): void {
    const exerciseId = Number(info.event.id);
    const selectedExercise = this.exercises.find(ex => ex.id === exerciseId);
    if (selectedExercise) {
      this.openExerciseDetail(selectedExercise);
    }
  }

  getExerciseTypeLabel(type: ExerciseType): string {
    return {
      [ExerciseType.PHYSICAL]: 'Physical',
      [ExerciseType.CONDITIONING]: 'Conditioning',
      [ExerciseType.TACTICAL]: 'Tactical',
      [ExerciseType.TECHNICAL]: 'Technical'
    }[type];
  }

  getVisibilityLabel(visibility: Visibility): string {
    return {
      [Visibility.PUBLIC]: 'Public',
      [Visibility.PRIVATE]: 'Private'
    }[visibility];
  }

  getExerciseTypeIcon(type: ExerciseType): string {
    return {
      [ExerciseType.PHYSICAL]: 'fitness_center',
      [ExerciseType.TECHNICAL]: 'build',
      [ExerciseType.TACTICAL]: 'sports_soccer',
      [ExerciseType.CONDITIONING]: 'directions_run'
    }[type];
  }

  getVisibilityIcon(visibility: Visibility): string {
    return {
      [Visibility.PUBLIC]: 'public',
      [Visibility.PRIVATE]: 'lock'
    }[visibility];
  }

  getStars(): number[] {
    return Array(5).fill(0).map((_, index) => index + 1);
  }

  isStarFilled(exercise: Exercise, starIndex: number): boolean {
    return exercise.averageRating ? starIndex <= Math.floor(exercise.averageRating) : false;
  }
  drop(event: CdkDragDrop<Exercise[]>): void {
    moveItemInArray(this.filteredExercises, event.previousIndex, event.currentIndex);
    this.exercises = [...this.filteredExercises];
    this.saveOrder();
  }
  // Removed duplicate saveOrder function
  getExerciseImage(exercise: Exercise): string {
    return exercise.image || 'assets/default-image.png'; // Chemin par défaut si pas d'image
  }
  saveOrder(): void {
    const order = this.exercises.map((exercise, index) => ({
        id: exercise.id!,
        order: index // Le backend mappe cela sur displayOrder
    }));
    this.exerciseService.reorderExercises(order).subscribe(
        () => console.log('Order saved successfully'),
        (error) => console.error('Error saving order:', error)
    );
}
}
