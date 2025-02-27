import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Exercise } from 'src/app/Models/exercise';
import { ExerciseService } from 'src/app/services/exercise.service';

@Component({
  selector: 'app-exercise-detail',
  templateUrl: './exercise-detail.component.html',
  styleUrls: ['./exercise-detail.component.css']
})
export class ExerciseDetailComponent implements OnInit {
  exercise: Exercise | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.exerciseService.findById(id).subscribe(
      (exercise) => (this.exercise = exercise),
      (error) => console.error("Erreur lors de la récupération de l'exercice", error)
    );
  }

  editExercise(): void {
    this.router.navigate(['/edit-exercise', this.exercise?.id]);
  }

  deleteExercise(): void {
    if (confirm('Voulez-vous vraiment supprimer cet exercice ?')) {
      this.exerciseService.delete(this.exercise!.id).subscribe(() => {
        alert('Exercice supprimé');
        this.router.navigate(['/list-exercise']);
      });
    }
  }
}
