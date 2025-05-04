import { Component, Output, EventEmitter } from '@angular/core';

interface Exercise {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface UserChoices {
  goal: string;
  subGoal: string;
  difficulty: string;
  duration: string;
  environment: string;
}

@Component({
  selector: 'app-generate-training-plan-wizard',
  templateUrl: './generate-training-plan-wizard.component.html',
  styleUrls: ['./generate-training-plan-wizard.component.css']
})
export class GenerateTrainingPlanWizardComponent {
  @Output() planGenerated = new EventEmitter<Exercise[]>(); // Émetteur pour le plan généré
  @Output() closeModal = new EventEmitter<void>(); // Émetteur pour fermer le modal

  currentStep: number = 1;
  userChoices: UserChoices = {
    goal: '',
    subGoal: '',
    difficulty: '',
    duration: '',
    environment: ''
  };
  points: number = 0;
  badges: string[] = [];
  recommendedExercises: Exercise[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Options pour chaque étape
  goals = ['Améliorer l\'endurance', 'Améliorer la technique', 'Améliorer la tactique'];
  subGoals: { [key: string]: string[] } = {
    'Améliorer l\'endurance': ['Endurance physique', 'Endurance mentale'],
    'Améliorer la technique': ['Dribbling', 'Passing', 'Shooting'],
    'Améliorer la tactique': ['Positionnement', 'Jeu collectif']
  };
  difficulties = ['Débutant', 'Intermédiaire', 'Avancé'];
  durations = ['30 min', '60 min', '90 min'];
  environments = ['Intérieur', 'Extérieur'];

  // Plans d'entraînement préconfigurés
  trainingPlans: { [key: string]: Exercise[] } = {
    'Améliorer l\'endurance_Endurance physique_Intermédiaire_60 min_Extérieur': [
      { id: '1', name: 'Course à pied', description: '40 min (Type: PHYSICAL)', type: 'PHYSICAL' },
      { id: '2', name: 'Sprints fractionnés', description: '20 min (Type: PHYSICAL)', type: 'PHYSICAL' }
    ],
    'Améliorer l\'endurance_Endurance mentale_Intermédiaire_60 min_Intérieur': [
      { id: '3', name: 'Méditation guidée', description: '30 min (Type: MENTAL)', type: 'MENTAL' },
      { id: '4', name: 'Exercices de concentration', description: '30 min (Type: MENTAL)', type: 'MENTAL' }
    ],
    'Améliorer la technique_Dribbling_Intermédiaire_60 min_Extérieur': [
      { id: '5', name: 'Dribbling Drills', description: '40 min (Type: TECHNICAL)', type: 'TECHNICAL' },
      { id: '6', name: 'Passing Practice', description: '20 min (Type: TECHNICAL)', type: 'TECHNICAL' }
    ]
    // Ajoutez d'autres combinaisons selon vos besoins
  };

  selectOption(option: string, step: string) {
    this.userChoices[step as keyof UserChoices] = option;
    this.points += 10; // Ajoute des points pour chaque choix
    this.currentStep++;

    // Vérifie si un badge est débloqué
    if (this.points >= 30 && !this.badges.includes('Explorateur d\'objectifs')) {
      this.badges.push('Explorateur d\'objectifs');
      this.successMessage = 'Badge débloqué : Explorateur d\'objectifs !';
    }

    // Si on atteint la dernière étape, générer le plan
    if (this.currentStep > 5) {
      this.generatePlan();
    }
  }

  generatePlan() {
    const key = `${this.userChoices.goal}_${this.userChoices.subGoal}_${this.userChoices.difficulty}_${this.userChoices.duration}_${this.userChoices.environment}`;
    this.recommendedExercises = this.trainingPlans[key] || [];
    if (this.recommendedExercises.length === 0) {
      this.errorMessage = 'Aucun plan d\'entraînement trouvé pour ces critères.';
    }
  }

  confirmPlan() {
    if (this.recommendedExercises.length === 0) {
      this.errorMessage = 'Aucun exercice à inclure dans le plan.';
      return;
    }

    this.planGenerated.emit(this.recommendedExercises);
    this.successMessage = 'Plan d\'entraînement généré avec succès !';
    this.close();
  }

  close() {
    this.closeModal.emit();
    this.currentStep = 1;
    this.userChoices = { goal: '', subGoal: '', difficulty: '', duration: '', environment: '' };
    this.recommendedExercises = [];
    this.errorMessage = null;
    this.successMessage = null;
  }
}