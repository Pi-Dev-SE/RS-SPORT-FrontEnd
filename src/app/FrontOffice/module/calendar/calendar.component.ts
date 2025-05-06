import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';  // Plugin pour la vue "dayGridMonth"
import { Exercise, ExerciseType } from '../exercises/model/exercise';
import { ExerciseService } from '../exercises/service/exercise-service.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  encapsulation: ViewEncapsulation.None
  
})
export class CalendarComponent implements OnInit {
  exercises: Exercise[] = [];
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth', // Vue du calendrier
    plugins: [dayGridPlugin],     // Plugin pour la vue "dayGridMonth"
    events: [],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    eventClick: this.handleEventClick.bind(this) // Gérer le clic sur un événement
  };

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.exerciseService.findAll().subscribe(
      (data) => {
        this.exercises = data;
        this.updateCalendarEvents();
      },
      (error) => {
        console.error('Error loading exercises', error);
      }
    );
  }

  updateCalendarEvents(): void {
    this.calendarOptions.events = this.exercises.map(ex => ({
      title: ex.name,
      date: ex.creationDate,
      id: ex.id?.toString(),
      backgroundColor: this.getColorByType(ex.exerciseType),
      borderColor: this.getColorByType(ex.exerciseType),
      extendedProps: {
        description: ex.description,
        type: ex.exerciseType
      }
    }));
  }

  getColorByType(type: ExerciseType): string {
    switch (type) {
      case ExerciseType.PHYSICAL: return '#e74c3c';
      case ExerciseType.CONDITIONING: return '#2ecc71';
      case ExerciseType.TACTICAL: return '#3498db';
      case ExerciseType.TECHNICAL: return '#9b59b6';
      default: return '#95a5a6';
    }
  }

  handleEventClick(info: any): void {
    console.log(info); // Logique à ajouter pour gérer le clic sur l'événement
  }
}
