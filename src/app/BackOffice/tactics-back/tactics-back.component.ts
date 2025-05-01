import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { TacticsBoardService, TacticsEngagementData, TacticsMonthlyActivity, TacticsPlayerCount } from '../../FrontOffice/tactic/tactics-board.service';
import { TacticsBoard } from '../../core/models/TacticsBoard';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-tactics-back',
  standalone: false,
  templateUrl: './tactics-back.component.html',
  styleUrl: './tactics-back.component.css'
})
export class TacticsBackComponent implements OnInit {
  // Tableaux tactiques
  tacticsBoards: TacticsBoard[] = [];
  selectedBoard: TacticsBoard | null = null;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;

  // Recherche et tri
  searchQuery: string = '';
  sortOption: string = 'newest';

  // Graphiques statistiques
  @ViewChild('engagementChart') engagementChartRef!: ElementRef;
  @ViewChild('activityChart') activityChartRef!: ElementRef;
  @ViewChild('playerCountChart') playerCountChartRef!: ElementRef;

  engagementChart: Chart | null = null;
  activityChart: Chart | null = null;
  playerCountChart: Chart | null = null;

  // Données pour les graphiques
  engagementData: TacticsEngagementData | null = null;
  monthlyActivityData: TacticsMonthlyActivity[] = [];
  playerCountData: TacticsPlayerCount[] = [];

  // Affichage des statistiques
  showStats: boolean = false;

  // Formulaires
  showAddForm: boolean = false;
  showUpdateForm: boolean = false;
  showDeleteConfirm: boolean = false;
  newTacticsBoard = { name: '' };
  updateTacticsBoardName: string = '';
  deleteTacticsBoardName: string = '';

  // Messages
  alertMessage: string = '';
  alertType: 'success' | 'danger' | 'warning' | 'info' | '' = '';

  constructor(private tacticsService: TacticsBoardService) {}

  ngOnInit(): void {
    this.loadTacticsBoards(this.currentPage);
    this.loadStatisticsData();
  }

  ngAfterViewInit(): void {
    // Les graphiques seront initialisés lorsque les données seront chargées
    // et que l'utilisateur clique sur le bouton pour afficher les statistiques
  }

  loadTacticsBoards(page: number): void {
    const sort = this.sortOption === 'newest' ? 'desc' : 'asc';

    this.tacticsService.getTacticsBoards(page - 1, this.pageSize, this.searchQuery, sort).subscribe({
      next: (response) => {
        this.tacticsBoards = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
      },
      error: (err) => {
        this.showAlert('Error loading tactics boards', 'danger');
        console.error('Error loading tactical displayboards:', err);
      }
    });
  }

  onSearchChange(): void {
    this.loadTacticsBoards(1); // Retour à la première page lors d'une recherche
  }

  onSortChange(): void {
    this.loadTacticsBoards(this.currentPage);
  }

  selectBoard(board: TacticsBoard): void {
    this.selectedBoard = board;
    this.updateTacticsBoardName = board.name;
  }

  createNewBoard(): void {
    if (!this.newTacticsBoard.name.trim()) {
      this.showAlert('Please enter a name for the tactics board', 'warning');
      return;
    }

    const newBoard: TacticsBoard = {
      name: this.newTacticsBoard.name,
      formation: {},
      version: 1,
      createdAt: new Date()
    };

    this.tacticsService.createTacticsBoard(newBoard).subscribe({
      next: (board) => {
        this.loadTacticsBoards(this.currentPage);
        this.newTacticsBoard.name = '';
        this.showAddForm = false;
        this.showAlert('Successfully created tactics board', 'success');
      },
      error: (err) => {
        if (err.message && err.message.includes('already exists')) {
          this.showAlert('This name already exists for the tactics board', 'warning');
        } else {
          this.showAlert('Error when creating the tactics board', 'danger');
          console.error('Error when creating the tactics board:', err);
        }
      }
    });
  }

  updateTacticsBoard(): void {
    if (!this.selectedBoard) {
      this.showAlert('No tactics board selected', 'warning');
      return;
    }

    if (!this.updateTacticsBoardName.trim()) {
      this.showAlert('Please enter a name for the tactics board', 'warning');
      return;
    }

    const updatedBoard: TacticsBoard = {
      ...this.selectedBoard,
      name: this.updateTacticsBoardName
    };

    this.tacticsService.updateTacticsBoard(this.selectedBoard.idTactic!, updatedBoard).subscribe({
      next: () => {
        this.loadTacticsBoards(this.currentPage);
        this.showUpdateForm = false;
        this.selectedBoard = null;
        this.showAlert('Tactics board successfully updated', 'success');
      },
      error: (err) => {
        if (err.message && err.message.includes('already exists')) {
          this.showAlert('This name already exists for the tactics board', 'warning');
        } else {
          this.showAlert('Error updating the tactics board', 'danger');
          console.error('Error updating the tactical table:', err);
        }
      }
    });
  }

  deleteTacticsBoard(): void {
    if (!this.selectedBoard) {
      this.showAlert('No tactics board selected', 'warning');
      return;
    }

    if (this.deleteTacticsBoardName !== this.selectedBoard.name) {
      this.showAlert('The name entered does not correspond to the selected tactics board.', 'warning');
      return;
    }

    this.tacticsService.deleteTacticsBoard(this.selectedBoard.idTactic!).subscribe({
      next: () => {
        this.loadTacticsBoards(this.currentPage);
        this.showDeleteConfirm = false;
        this.selectedBoard = null;
        this.deleteTacticsBoardName = '';
        this.showAlert('The tactics board has been successfully removed', 'success');
      },
      error: (err) => {
        this.showAlert('Error when deleting the tactical board', 'danger');
        console.error('Error when deleting tactical board:', err);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTacticsBoardName = '';
  }

  cancelUpdate(): void {
    this.showUpdateForm = false;
    this.updateTacticsBoardName = '';
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newTacticsBoard.name = '';
  }

  showAlert(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
      this.alertType = '';
    }, 5000);
  }

  // Méthodes pour les statistiques
  loadStatisticsData(): void {
    // Charger les données d'engagement
    this.tacticsService.getEngagementData().subscribe({
      next: (data) => {
        this.engagementData = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données d\'engagement:', err);
        this.showAlert('Erreur lors du chargement des données d\'engagement', 'warning');
      }
    });

    // Charger les données d'activité mensuelle
    this.tacticsService.getMonthlyActivityData().subscribe({
      next: (data) => {
        this.monthlyActivityData = data;
        if (data.length === 0) {
          console.warn('Aucune donnée d\'activité mensuelle disponible');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données d\'activité mensuelle:', err);
        this.showAlert('Erreur lors du chargement des données d\'activité mensuelle', 'warning');
        this.monthlyActivityData = [];
      }
    });

    // Charger les données du nombre de joueurs par tableau
    this.tacticsService.getPlayerCountByBoard().subscribe({
      next: (data) => {
        this.playerCountData = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du nombre de joueurs par tableau:', err);
        this.showAlert('Erreur lors du chargement du nombre de joueurs par tableau', 'warning');
      }
    });
  }


  toggleStats(): void {
    this.showStats = !this.showStats;

    if (this.showStats) {
      // Recharger les données statistiques pour avoir les informations les plus récentes
      this.loadStatisticsData();

      // Attendre que les références DOM soient disponibles et que les données soient chargées
      setTimeout(() => {
        this.initCharts();
      }, 300); // Augmenter le délai pour s'assurer que les données sont chargées
    }
  }

  initCharts(): void {
    // Vérifier si les données sont disponibles avant d'initialiser les graphiques
    if (!this.engagementData && !this.monthlyActivityData.length && !this.playerCountData.length) {
      console.warn('Aucune donnée statistique disponible pour initialiser les graphiques');
      this.showAlert('Aucune donnée statistique disponible pour le moment', 'info');
    }

    // Initialiser les graphiques même si certaines données sont manquantes
    // Chaque méthode d'initialisation gère individuellement l'absence de données
    this.initEngagementChart();
    this.initActivityChart();
    this.initPlayerCountChart();
  }

  initEngagementChart(): void {
    if (!this.engagementChartRef) return;

    const ctx = this.engagementChartRef.nativeElement.getContext('2d');

    if (this.engagementChart) {
      this.engagementChart.destroy();
    }

    // Vérifier si des données sont disponibles
    if (!this.engagementData) {
      // Afficher un message dans le canvas si aucune donnée n'est disponible
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6c757d';
      ctx.fillText('Aucune donnée d\'engagement disponible', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    // Vérifier si les données sont valides (pas de valeurs négatives ou NaN)
    const modifiedBoards = this.engagementData.modifiedBoards || 0;
    const unchangedBoards = this.engagementData.unchangedBoards || 0;

    // Créer le graphique avec les données disponibles
    this.engagementChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Tableaux modifiés', 'Tableaux inchangés'],
        datasets: [{
          data: [modifiedBoards, unchangedBoards],
          backgroundColor: ['#4e73df', '#1cc88a'],
          hoverBackgroundColor: ['#2e59d9', '#17a673'],
          hoverBorderColor: 'rgba(234, 236, 244, 1)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Taux d\'engagement des tableaux tactiques',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }

  initActivityChart(): void {
    if (!this.activityChartRef) return;

    const ctx = this.activityChartRef.nativeElement.getContext('2d');

    if (this.activityChart) {
      this.activityChart.destroy();
    }

    // Vérifier si des données sont disponibles
    if (this.monthlyActivityData.length === 0) {
      // Afficher un message dans le canvas si aucune donnée n'est disponible
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6c757d';
      ctx.fillText('Aucune donnée d\'activité mensuelle disponible', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    // Créer le graphique avec les données disponibles
    this.activityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthlyActivityData.map(item => item.month),
        datasets: [{
          label: 'Nombre d\'éditions',
          data: this.monthlyActivityData.map(item => item.count),
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          borderColor: 'rgba(78, 115, 223, 1)',
          pointRadius: 3,
          pointBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointBorderColor: 'rgba(78, 115, 223, 1)',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
          pointHitRadius: 10,
          pointBorderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Fréquence d\'édition des tableaux tactiques par mois',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }

  initPlayerCountChart(): void {
    if (!this.playerCountChartRef) return;

    const ctx = this.playerCountChartRef.nativeElement.getContext('2d');

    if (this.playerCountChart) {
      this.playerCountChart.destroy();
    }

    // Vérifier si des données sont disponibles
    if (this.playerCountData.length === 0) {
      // Afficher un message dans le canvas si aucune donnée n'est disponible
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6c757d';
      ctx.fillText('Aucune donnée de joueurs par tableau disponible', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    // Limiter à 5 tableaux pour une meilleure lisibilité
    const displayData = this.playerCountData.slice(0, 5);

    // Vérifier si les données sont valides
    if (displayData.some(item => !item.boardName || item.playerCount === undefined)) {
      console.warn('Certaines données de joueurs par tableau sont invalides');
    }

    // Créer le graphique avec les données disponibles
    this.playerCountChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: displayData.map(item => item.boardName || 'Sans nom'),
        datasets: [{
          label: 'Nombre de joueurs',
          data: displayData.map(item => item.playerCount || 0),
          backgroundColor: [
            'rgba(78, 115, 223, 0.8)',
            'rgba(28, 200, 138, 0.8)',
            'rgba(246, 194, 62, 0.8)',
            'rgba(54, 185, 204, 0.8)',
            'rgba(231, 74, 59, 0.8)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Nombre de joueurs par tableau tactique',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
}
