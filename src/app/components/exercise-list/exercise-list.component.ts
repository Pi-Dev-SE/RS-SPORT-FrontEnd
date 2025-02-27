import { Component } from "@angular/core";
import { Exercise } from "src/app/Models/exercise";
@Component({
  selector: 'app-exercise-list', // Ensure this selector is unique
  templateUrl: './exercise-list.component.html', // or use `template` for inline HTML
  styleUrls: ['./exercise-list.component.css'] // Optional: if you have styles
})
export class ExerciseListComponent {
  exercises: any[] = []; // Initialize with your data or leave it empty
  displayDialog: boolean = false;
  exercise: any = { // Initialize the exercise object
    id: null,
    name: '',
    description: '',
    image: null
  };// Initialisation de l'objet exercise avec une instance d'Exercise

  // Logique pour afficher l'aperçu de l'image
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.exercise.image = reader.result as string;  // Créer un URL pour l'image
      };
      reader.readAsDataURL(file);
    }
  }

  openDialog() {
    this.exercise = new Exercise();  // Réinitialiser les champs de l'objet
    this.displayDialog = true;
  }

  saveExercise(form: any) {
    if (form.valid) {
      // Logique pour sauvegarder l'exercice
      console.log('Exercice ajouté:', this.exercise);
      this.exercises.push({ ...this.exercise, id: this.exercises.length + 1 });
      this.displayDialog = false;
    }
  }

  onDeleteExercise(id: number) {
    // Logique pour supprimer l'exercice
    this.exercises = this.exercises.filter(exercise => exercise.id !== id);
  }

  redirectToComponent(id: number) {
    // Logique pour rediriger vers les détails de l'exercice
  }
}
