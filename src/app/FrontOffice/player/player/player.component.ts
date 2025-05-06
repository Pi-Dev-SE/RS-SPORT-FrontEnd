import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Player, TypeStatusHealth } from '../models/player.model';
import { PlayerService } from '../services/player.service';
import { PlayerStatistics } from '../models/player-statistics.model';
import { PlayerStatisticsService } from '../services/player-statistics.service';
import { debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  players: Player[] = [];
  filteredPlayers: Player[] = [];
  selectedPlayer: Player | null = null;
  isEditing = false;
  isAdding = false;
  playerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  healthStatusOptions = Object.values(TypeStatusHealth);
  searchTerm = ''; // Track search term
  
  // Add club filtering support
  clubId?: number;
  filteringByClub = false;
  
  // Image upload
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  // Player statistics
  playerStatistics: PlayerStatistics[] = [];
  isAddingStats = false;
  isEditingStats = false;
  selectedStatistic: PlayerStatistics | null = null;
  statsForm: FormGroup;
  statsChartData: any = {};
  statsLoading = false;

  constructor(
    private playerService: PlayerService, 
    private playerStatsService: PlayerStatisticsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.playerForm = this.createPlayerForm();
    this.statsForm = this.createStatsForm();
  }

  ngOnInit(): void {
    // Check for clubId query parameter
    this.route.queryParams.subscribe(params => {
      if (params['clubId']) {
        this.clubId = +params['clubId'];
        this.filteringByClub = true;
        this.loadPlayersByClubId();
      } else {
        this.clubId = undefined;
        this.filteringByClub = false;
        this.loadAllPlayers();
      }
    });
  }

  ngAfterViewInit(): void {
    // With the [(ngModel)] binding, we no longer need the complex search setup
    // but we'll keep it for compatibility
    setTimeout(() => {
      if (this.searchInput && this.searchInput.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);
  }
  
  // Create a form for player statistics
  createStatsForm(): FormGroup {
    return this.fb.group({
      plystaId: [null],
      performanceRate: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      goalsScored: [0, [Validators.required, Validators.min(0)]],
      assists: [0, [Validators.required, Validators.min(0)]]
    });
  }

  // Method for search button click
  performSearch(): void {
    this.filterPlayers(this.searchTerm);
  }

  // Clear search results
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredPlayers = [...this.players];
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  filterPlayers(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredPlayers = [...this.players];
      return;
    }
    
    searchTerm = searchTerm.toLowerCase().trim();
    this.filteredPlayers = this.players.filter(player => 
      (player.firstname?.toLowerCase().includes(searchTerm) || 
       player.lastname?.toLowerCase().includes(searchTerm) || 
       player.position?.toLowerCase().includes(searchTerm) ||
       player.jerseyNumber?.toString().includes(searchTerm) ||
       this.getFullName(player).toLowerCase().includes(searchTerm))
    );
  }

  createPlayerForm(): FormGroup {
    return this.fb.group({
      id: [null],
      position: ['', Validators.required],
      jerseyNumber: [null, [Validators.required, Validators.min(1), Validators.max(99)]],
      healthStatus: [TypeStatusHealth.ACTIVE, Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dateOfBirth: ['', Validators.required], // Added date of birth field
      playerImage: [null] // Added player image field
    });
  }
  
  // Handle file selection
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length) {
      this.selectedFile = element.files[0];
      this.createImagePreview();
      this.playerForm.patchValue({ playerImage: this.selectedFile });
    }
  }

  // Create image preview
  createImagePreview(): void {
    if (!this.selectedFile) {
      this.previewUrl = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }
  
  // Get player's full name by combining first and last name
  getFullName(player: Player): string {
    return `${player.firstname || ''} ${player.lastname || ''}`.trim();
  }

  // Convert enum values to more readable display
  getStatusDisplay(status: string): string {
    // If the status is already formatted, just return it
    if (status === 'Active' || status === 'Injured' || status === 'Recovering') {
      return status;
    }
    
    // Otherwise, convert uppercase to title case (e.g., ACTIVE -> Active)
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  loadPlayers(): void {
    if (this.filteringByClub && this.clubId) {
      this.loadPlayersByClubId();
    } else {
      this.loadAllPlayers();
    }
  }

  loadAllPlayers(): void {
    this.loading = true;
    this.playerService.getAllPlayers().subscribe({
      next: (data) => {
        this.players = data;
        // Apply any existing search term when refreshing data
        if (this.searchTerm) {
          this.filterPlayers(this.searchTerm);
        } else {
          this.filteredPlayers = [...data];
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load players. Please try again.';
        this.loading = false;
        console.error('Error loading players:', error);
      }
    });
  }

  loadPlayersByClubId(): void {
    if (!this.clubId) return;
    
    this.loading = true;
    this.playerService.getPlayersByClubId(this.clubId).subscribe({
      next: (data) => {
        this.players = data;
        // Apply any existing search term when refreshing data
        if (this.searchTerm) {
          this.filterPlayers(this.searchTerm);
        } else {
          this.filteredPlayers = [...data];
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = `Failed to load players for club ${this.clubId}. Please try again.`;
        this.loading = false;
        console.error(`Error loading players for club ${this.clubId}:`, error);
      }
    });
  }

  // Method to clear club filter
  clearClubFilter(): void {
    this.clubId = undefined;
    this.filteringByClub = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { clubId: null },
      queryParamsHandling: 'merge'
    });
    this.loadAllPlayers();
  }

  addPlayer(): void {
    this.isEditing = false;
    this.isAdding = true;
    this.selectedPlayer = null;
    this.playerForm.reset();
    this.playerForm.patchValue({ healthStatus: TypeStatusHealth.ACTIVE });
    this.previewUrl = null;
    this.selectedFile = null;
    
    // Make password required for new players
    this.playerForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.playerForm.get('password')?.updateValueAndValidity();
  }

  editPlayer(player: Player): void {
    this.isEditing = true;
    this.isAdding = false;
    this.selectedPlayer = player;
    this.previewUrl = player.playerImage as string || null;
    this.selectedFile = null;
    
    // Make password optional when editing
    this.playerForm.get('password')?.setValidators(Validators.minLength(6));
    this.playerForm.get('password')?.updateValueAndValidity();
    
    // Set form values from player, including the ID
    this.playerForm.patchValue({
      id: player.id,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      healthStatus: player.healthStatus,
      firstname: player.firstname,
      lastname: player.lastname,
      email: player.email,
      dateOfBirth: player.dateOfBirth,
      // Don't set the password in the form - we'll handle it separately
    });
  }

  viewPlayerDetails(player: Player): void {
    this.selectedPlayer = player;
    this.isEditing = false;
    this.isAdding = false;
    
    // Load player statistics when viewing player details
    if (player && player.id) {
      this.loadPlayerStatistics(player.id);
    }
  }

  deletePlayer(id: number): void {
    if (confirm('Are you sure you want to delete this player?')) {
      this.loading = true;
      this.playerService.deletePlayer(id).subscribe({
        next: () => {
          this.successMessage = 'Player deleted successfully!';
          this.loadPlayers();
          this.selectedPlayer = null;
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete player. Please try again.';
          this.loading = false;
          console.error('Error deleting player:', error);
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      return;
    }

    const playerData: Player = this.playerForm.value;
    
    // Add file to the player data if selected
    if (this.selectedFile) {
      playerData.playerImage = this.selectedFile;
    }
    
    this.loading = true;

    if (this.isEditing && this.selectedPlayer) {
      // If password is empty, don't include it in the update
      if (!playerData.password) {
        delete playerData.password;
      }
      
      this.playerService.updatePlayer(this.selectedPlayer.id, playerData).subscribe({
        next: (updatedPlayer) => {
          this.successMessage = 'Player updated successfully!';
          this.loadPlayers(); // This will now preserve the search term
          this.selectedPlayer = updatedPlayer;
          this.isEditing = false;
          this.loading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = `Failed to update player: ${error.error || 'Please try again.'}`;
          this.loading = false;
          console.error('Error updating player:', error);
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    } else {
      this.playerService.addPlayer(playerData).subscribe({
        next: (newPlayer) => {
          this.successMessage = 'Player added successfully!';
          this.loadPlayers(); // This will now preserve the search term
          this.selectedPlayer = newPlayer;
          this.isAdding = false;
          this.loading = false;
          this.previewUrl = null;
          this.selectedFile = null;
          this.playerForm.reset();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = `Failed to add player: ${error.error || 'Please try again.'}`;
          this.loading = false;
          console.error('Error adding player:', error);
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    }
  }

  cancelEdit(): void {
    this.playerForm.reset();
    this.isAdding = false;
    this.previewUrl = null;
    this.selectedFile = null;
    if (this.selectedPlayer) {
      this.viewPlayerDetails(this.selectedPlayer);
    } else {
      this.selectedPlayer = null;
    }
    this.isEditing = false;
  }

  // PLAYER STATISTICS METHODS

  // Load statistics for a specific player
  loadPlayerStatistics(playerId: number): void {
    this.statsLoading = true;
    this.playerStatsService.getPlayerStatistics(playerId).subscribe({
      next: (data) => {
        this.playerStatistics = data;
        this.prepareChartData(data);
        this.statsLoading = false;
      },
      error: (error) => {
        console.error('Error loading player statistics:', error);
        this.statsLoading = false;
      }
    });
  }

  // Prepare chart data for visualization
  prepareChartData(statistics: PlayerStatistics[]): void {
    // Sort statistics by date (oldest to newest)
    const sortedStats = [...statistics].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract dates for labels and metrics for datasets
    const labels = sortedStats.map(stat => new Date(stat.date).toLocaleDateString());
    const performanceData = sortedStats.map(stat => stat.performanceRate);
    const goalsData = sortedStats.map(stat => stat.goalsScored);
    const assistsData = sortedStats.map(stat => stat.assists);

    this.statsChartData = {
      labels,
      datasets: [
        { 
          label: 'Performance Rating',
          data: performanceData,
          borderColor: '#4c76e0',
          backgroundColor: 'rgba(76, 118, 224, 0.2)',
          fill: true,
          tension: 0.4
        },
        { 
          label: 'Goals Scored',
          data: goalsData,
          borderColor: '#e63946',
          backgroundColor: 'rgba(230, 57, 70, 0.2)',
          fill: true,
          tension: 0.4
        },
        { 
          label: 'Assists',
          data: assistsData,
          borderColor: '#2a9d8f',
          backgroundColor: 'rgba(42, 157, 143, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  // Start adding statistics for a player
  addStatistics(): void {
    if (!this.selectedPlayer || !this.selectedPlayer.id) {
      this.errorMessage = 'Cannot add statistics: No player selected';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.isAddingStats = true;
    this.isEditingStats = false;
    this.selectedStatistic = null;
    this.statsForm.reset();
    
    // Set default values
    this.statsForm.patchValue({
      date: new Date().toISOString().split('T')[0],
      performanceRate: 5,
      goalsScored: 0,
      assists: 0
    });
  }

  // Edit existing statistics
  editStatistics(stat: PlayerStatistics): void {
    this.isAddingStats = false;
    this.isEditingStats = true;
    this.selectedStatistic = stat;
    
    this.statsForm.patchValue({
      plystaId: stat.plystaId,
      date: new Date(stat.date).toISOString().split('T')[0],
      performanceRate: stat.performanceRate,
      goalsScored: stat.goalsScored,
      assists: stat.assists
    });
  }

  // Delete statistics
  deleteStatistics(statId: number): void {
    if (confirm('Are you sure you want to delete this statistic record?')) {
      this.statsLoading = true;
      
      this.playerStatsService.deletePlayerStatistics(statId).subscribe({
        next: () => {
          this.successMessage = 'Statistics deleted successfully!';
          if (this.selectedPlayer && this.selectedPlayer.id) {
            this.loadPlayerStatistics(this.selectedPlayer.id);
          }
          this.statsLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete statistics. Please try again.';
          this.statsLoading = false;
          console.error('Error deleting statistics:', error);
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  // Submit statistics form
  onStatisticsSubmit(): void {
    if (this.statsForm.invalid || !this.selectedPlayer || !this.selectedPlayer.id) {
      return;
    }

    const statsData: PlayerStatistics = this.statsForm.value;
    this.statsLoading = true;

    if (this.isEditingStats && this.selectedStatistic && this.selectedStatistic.plystaId) {
      // Update existing statistics
      this.playerStatsService.updatePlayerStatistics(this.selectedStatistic.plystaId, statsData).subscribe({
        next: () => {
          this.successMessage = 'Statistics updated successfully!';
          if (this.selectedPlayer && this.selectedPlayer.id) {
            this.loadPlayerStatistics(this.selectedPlayer.id);
          }
          this.isEditingStats = false;
          this.isAddingStats = false;
          this.statsLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update statistics. Please try again.';
          this.statsLoading = false;
          console.error('Error updating statistics:', error);
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    } else {
      // Add new statistics
      this.playerStatsService.addPlayerStatistics(this.selectedPlayer.id, statsData).subscribe({
        next: () => {
          this.successMessage = 'Statistics added successfully!';
          if (this.selectedPlayer && this.selectedPlayer.id) {
            this.loadPlayerStatistics(this.selectedPlayer.id);
          }
          this.isAddingStats = false;
          this.statsLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to add statistics. Please try again.';
          this.statsLoading = false;
          console.error('Error adding statistics:', error);
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  // Cancel statistics form edit/add
  cancelStatisticsEdit(): void {
    this.isAddingStats = false;
    this.isEditingStats = false;
    this.selectedStatistic = null;
    this.statsForm.reset();
  }

  // Calculate average performance
  getAveragePerformance(): number {
    if (!this.playerStatistics || this.playerStatistics.length === 0) {
      return 0;
    }
    const total = this.playerStatistics.reduce((sum, stat) => sum + stat.performanceRate, 0);
    return parseFloat((total / this.playerStatistics.length).toFixed(1));
  }

  // Get total goals for the player
  getTotalGoals(): number {
    if (!this.playerStatistics || this.playerStatistics.length === 0) {
      return 0;
    }
    return this.playerStatistics.reduce((sum, stat) => sum + stat.goalsScored, 0);
  }

  // Get total assists for the player
  getTotalAssists(): number {
    if (!this.playerStatistics || this.playerStatistics.length === 0) {
      return 0;
    }
    return this.playerStatistics.reduce((sum, stat) => sum + stat.assists, 0);
  }

  // Download player report
  downloadPlayerReport(playerId: number): void {
    if (!playerId) {
      this.errorMessage = 'Cannot download report: Invalid player ID';
      return;
    }
    
    // Show loading or feedback
    this.loading = true;
    
    // Create a function to create and trigger download
    const downloadPdf = () => {
      // Create a link element
      const link = document.createElement('a');
      link.href = `http://localhost:8088/spr01/api/reports/player/${playerId}`;
      link.setAttribute('download', `player_stats_${playerId}.pdf`);
      link.setAttribute('target', '_blank');
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Hide loading
      this.loading = false;
      this.successMessage = 'Player report download initiated!';
      setTimeout(() => this.successMessage = '', 3000);
    };
    
    // Call the download function
    downloadPdf();
  }
}
