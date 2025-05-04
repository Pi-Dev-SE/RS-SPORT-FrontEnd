import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { TacticsBoardService, TacticsEngagementData, TacticsMonthlyActivity, TacticsPlayerCount } from '../../FrontOffice/tactic/tactics-board.service';
import { TacticsBoard } from '../../core/models/TacticsBoard';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js/auto';
import { saveAs } from 'file-saver';

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
        this.showAlert('Error loading engagement data', 'warning');
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
        this.showAlert('Error loading monthly activity data', 'warning');
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
        this.showAlert('Error loading number of players per table', 'warning');
      }
    });
  }

  // Méthodes d'exportation CSV
  exportEngagementData(): void {
    if (!this.engagementData) {
      this.showAlert('No data available for export', 'warning');
      return;
    }

    // Création des données CSV avec structure claire en colonnes au format dataset professionnel
    const headers = ['Rk', 'Board type', 'Number'];
    const rows = [
      [1, 'Modified boards', this.engagementData.modifiedBoards],
      [2, 'Unchanged boards', this.engagementData.unchangedBoards]
    ];

    // Génération du fichier CSV au format professionnel
    const csvContent = this.generateCSV( headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

    // Téléchargement du fichier
    saveAs(blob, `engagement-tactics-boards-${this.formatDate(new Date())}.csv`);
    this.showAlert('Successful export', 'success');
  }

  exportMonthlyActivityData(): void {
    if (this.monthlyActivityData.length === 0) {
      this.showAlert('No data available for export', 'warning');
      return;
    }

    // Création des données CSV avec structure claire en colonnes au format dataset professionnel
    const headers = ['Rk', 'Months', 'Number of editions'];

    // Préparation des données avec formatage pour un meilleur alignement
    const rows = this.monthlyActivityData.map((item: TacticsMonthlyActivity, index: number) => {
      return [index + 1, item.month, item.count];
    });

    // Génération du fichier CSV au format professionnel
    const csvContent = this.generateCSV( headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

    // Téléchargement du fichier
    saveAs(blob, `monthly-activity-tactics-boards-${this.formatDate(new Date())}.csv`);
    this.showAlert('Export success', 'success');
  }

  exportPlayerCountData(): void {
    if (this.playerCountData.length === 0) {
      this.showAlert('No export data available', 'warning');
      return;
    }

    // Création des données CSV avec structure claire en colonnes au format dataset professionnel
    const headers = ['Rk', 'Board name', 'Number of players'];

    // Préparation des données avec formatage pour un meilleur alignement
    const rows = this.playerCountData.map((item: TacticsPlayerCount, index: number) => {
      return [index + 1, item.boardName || 'No name', item.playerCount || 0];
    });

    // Génération du fichier CSV au format professionnel
    const csvContent = this.generateCSV( headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

    // Téléchargement du fichier
    saveAs(blob, `players-per-tactics-board-${this.formatDate(new Date())}.csv`);
    this.showAlert('Successful export', 'success');
  }

  // Méthode pour exporter toutes les statistiques en un seul fichier au format dataset professionnel
  exportAllStatistics(): void {
    // 1) Vérifier la disponibilité des données
    if (!this.engagementData && this.monthlyActivityData.length === 0 && this.playerCountData.length === 0) {
      this.showAlert('No export data available', 'warning');
      return;
    }

    // 2) Préparer l'en-tête et les lignes combinées
    const headers = [
      'Rk',
      'Board name',
      'Number of players',
      'Number of editions',
      'Modified boards',
      'Unchanged boards'
    ];
    const rows: any[] = [];

    // Remplir les lignes pour chaque board
    this.playerCountData.forEach((p, i) => {
      const engagement = this.engagementData || { modifiedBoards: 0, unchangedBoards: 0 };
      const activity = this.monthlyActivityData.find(a => a.month === p.boardName) || { count: 0 };
      rows.push([
        i + 1,
        p.boardName || 'Sans nom',
        p.playerCount || 0,
        activity.count || 0,
        engagement.modifiedBoards || 0,
        engagement.unchangedBoards || 0
      ]);
    });

    // 3) Générer le CSV grâce à la méthode generateCSV (avec BOM et point-virgule)
    const csvContent = this.generateCSV(headers, rows);

    // 4) Télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `statistics-tactics-boards-${this.formatDate(new Date())}.csv`);
    this.showAlert('Successful export of all statistics', 'success');
  }


  // Méthode utilitaire pour échapper les valeurs CSV avec support pour le format tabulaire
  private escapeCSVValues(values: any[]): string[] {
    return values.map((value: any) => {
      const stringValue = String(value);
      // Échapper les caractères spéciaux pour le format tabulaire
      if (stringValue.includes('\t') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`; // Échapper les guillemets doubles
      }
      // Aligner les valeurs numériques à droite pour un meilleur rendu visuel
      if (!isNaN(Number(stringValue)) && stringValue !== '') {
        // Ajouter des espaces pour aligner les nombres
        return stringValue.padStart(Math.max(4, stringValue.length), ' ');
      }
      return stringValue;
    });
  }

  // Méthode utilitaire pour générer un fichier CSV bien formaté au format dataset professionnel
  private generateCSV(headers: string[], rows: any[]): string {
    const BOM = '\uFEFF';
    const exportDate = this.formatDate(new Date());
    const title = `Tactics Board Statistics (${exportDate})`;

    // 1. BOM + titre + date en lignes commentées (optionnel)
    let csv = BOM + `# ${title}\r\n`;

    // 2. Ligne d’en-tête
    csv += headers.join(';') + '\r\n';

    // 3. Lignes de données
    rows.forEach(row => {
      const escaped = row.map((Value: any) => {
        const str = String(Value).replace(/"/g, '""');
        return (/[;\r\n"]/.test(str)) ? `"${str}"` : str;
      });
      csv += escaped.join(';') + '\r\n';
    });

    return csv;
  }



  // Formater la date pour les noms de fichiers
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
      this.showAlert('No statistical data available at present', 'info');
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
      ctx.fillText('No engagement data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    // Vérifier si les données sont valides (pas de valeurs négatives ou NaN)
    const modifiedBoards = this.engagementData.modifiedBoards || 0;
    const unchangedBoards = this.engagementData.unchangedBoards || 0;

    // Créer le graphique avec les données disponibles
    this.engagementChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Modified boards', 'Unchanged boards'],
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
            text: 'Commitment rate of tactics boards',
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
      ctx.fillText('No monthly activity data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    // Créer le graphique avec les données disponibles
    this.activityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthlyActivityData.map((item: TacticsMonthlyActivity) => item.month),
        datasets: [{
          label: 'Number of editions',
          data: this.monthlyActivityData.map((item: TacticsMonthlyActivity) => item.count),
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
            text: 'Frequency of tactical charts per month',
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
      ctx.fillText('No player data available for each board', ctx.canvas.width / 2, ctx.canvas.height / 2);
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
        labels: displayData.map((item: TacticsPlayerCount) => item.boardName || 'No name'),
        datasets: [{
          label: 'Number of players',
          data: displayData.map((item: TacticsPlayerCount) => item.playerCount || 0),
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
            text: 'Number of players per tactics board',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
}
