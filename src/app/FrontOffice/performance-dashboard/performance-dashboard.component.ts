import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { PerformanceTracking } from '../../Models/PerformanceTracking';
import { TendanceProgression } from '../../Models/TendanceProgression';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PerformanceService } from '../../services/performance.service';
import {
  
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import Swal from 'sweetalert2';

// ✅ Enregistrement obligatoire pour Chart.js v3+
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Filler,
  Legend
);

@Component({
  selector: 'app-performance-dashboard',
  templateUrl: './performance-dashboard.component.html',
  styleUrl: './performance-dashboard.component.css'
})
export class PerformanceDashboardComponent implements OnInit {


  playerId: number | undefined;
  historique: PerformanceTracking[] = [];
  dernierePerformance: PerformanceTracking | undefined;
  tendance: TendanceProgression | undefined;
  recommendations: string[] = [];

  performanceChart: Chart | undefined;
  progressionChart: Chart | undefined;

  dateDebut: string | undefined;
  dateFin: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private performanceService: PerformanceService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    const playerIdParam = this.route.snapshot.paramMap.get('playerId');
    this.playerId = playerIdParam ? +playerIdParam : undefined;
    
    // Initialiser les dates (3 derniers mois)
    const today = new Date();
    this.dateFin = this.formatDate(today);
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    this.dateDebut = this.formatDate(threeMonthsAgo);
    
    this.chargerDonnees();
  }
  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }
  
  chargerDonnees(): void {
    // Chargement de l'historique des performances
    if (this.playerId !== undefined) {
      this.performanceService.getHistoriqueJoueur(this.playerId).subscribe(
        data => {
          this.historique = data;
          this.creerGraphiquePerformance();
        }
      );
    }
    if (this.playerId !== undefined) {
      this.performanceService.getDernierePerformance(this.playerId).subscribe(
        data => {
          this.dernierePerformance = data;
        }
      );
    }
    
    // Chargement de la tendance
    if (this.playerId !== undefined) {
      this.performanceService.getTendanceProgression(this.playerId, this.dateDebut!, this.dateFin!).subscribe(
        data => {
          this.tendance = data;
          this.creerGraphiqueProgression();
        }
      );
    }
    
    // Chargement des recommandations
    if (this.playerId !== undefined) {
      this.performanceService.getRecommandations(this.playerId).subscribe(
        data => {
          // Handle various potential data formats
          if (!data || !data.recommendations) {
            this.recommendations = [];
          } else if (Array.isArray(data.recommendations)) {
            this.recommendations = data.recommendations;
          } else if (typeof data.recommendations === 'string') {
            // Split the string by periods if it's a single string with multiple recommendations
            this.recommendations = data.recommendations.split('.').map(rec => rec.trim()).filter(rec => rec.length > 0);
          } else {
            // Fallback for any other format
            this.recommendations = [data.recommendations];
          }
        },
        error => {
          console.error('Error fetching recommendations:', error);
          this.recommendations = [];
        }
      );
    }
}

filtrerParDate(): void {
  if (this.playerId == null || !this.dateDebut || !this.dateFin) {
    console.warn("Les paramètres nécessaires ne sont pas fournis.");
    return;
  }

  this.performanceService.getTendanceProgression(this.playerId, this.dateDebut, this.dateFin).subscribe({
    next: (data) => {
      this.tendance = data;
      this.creerGraphiqueProgression();
    },
    error: (err) => {
      console.error("Erreur lors de la récupération des données de progression :", err);
    }
  });
}


creerGraphiquePerformance(): void {
  if (this.historique.length === 0) return;
  
  // Limiter aux 10 dernières entrées pour la lisibilité
  const dernieresEntrees = this.historique.slice(0, 10).reverse();
  
  const labels = dernieresEntrees.map(p => this.datePipe.transform(p.dateSuivi, 'dd/MM'));
  const douleurData = dernieresEntrees.map(p => p.douleur);
  const enduranceData = dernieresEntrees.map(p => p.endurance);
  
  
  if (this.performanceChart) {
    this.performanceChart.destroy();
  }
  
  this.performanceChart = new Chart('performanceCanvas', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Douleur',
          data: douleurData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3
        },
        {
          label: 'Endurance',
          data: enduranceData,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.3
        },
        
       
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

creerGraphiqueProgression(): void {
  if (!this.tendance) return;
  
  // Pour visualiser la progression globale du score
  const progressionData = this.historique
    .slice(0, 10)
    .reverse()
    .map(p => p.scoreProgression);
  
  const labels = this.historique
    .slice(0, 10)
    .reverse()
    .map(p => this.datePipe.transform(p.dateSuivi, 'dd/MM'));
  
  if (this.progressionChart) {
    this.progressionChart.destroy();
  }
  
  this.progressionChart = new Chart('progressionCanvas', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Score de progression',
          data: progressionData,
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 200
        }
      }
    }
  });
}

deletePerformance(id: number) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      this.performanceService.deletePerformance(id).subscribe({
        next: () => {
          this.chargerDonnees();
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
        },
        error: (err) => {
          console.error('Error deleting performance:', err);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the performance.",
            icon: "error"
          });
        }
      });
    }
  });
}


editPerformance(id: number) {
  this.router.navigate(['/AddPerformance'],{ queryParams: { id: id } } )
  
  }




}




