import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../../services/game.service';
import { Game, GameDto, GameStatus, MatchPrediction } from '../../../Models/Game';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit {
  games: GameDto[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  GameStatus = GameStatus; // For use in template
  statusFilter: string = 'ALL';
  searchTerm: string = '';
  filteredGames: GameDto[] = [];
  predictionLoading: { [key: number]: boolean } = {}; // Track loading state per game

  constructor(
    private gameService: GameService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.loading = true;
    this.gameService.getAllGames().subscribe({
      next: (gamesResponse) => {
        console.log('Loaded games:', gamesResponse);
        
        // Transform the response to match our GameDto interface
        this.games = gamesResponse.map(game => {
          // Extract team information from gameSheet if available
          const homeTeamName = game.gameSheet?.homeTeam?.teamName || 'Unknown Team';
          const awayTeamName = game.gameSheet?.awayTeam?.teamName || 'Unknown Team';
          const homeTeamId = game.gameSheet?.homeTeam?.teamId;
          const awayTeamId = game.gameSheet?.awayTeam?.teamId;
          
          return {
            ...game,
            homeTeamName,
            awayTeamName,
            homeTeamId,
            awayTeamId
          };
        });
        
        this.applyFilters();
        this.loading = false;
        
        // Load predictions for scheduled games
        this.games.forEach(game => {
          if (game.status === GameStatus.SCHEDULED && game.homeTeamId && game.awayTeamId) {
            this.loadPrediction(game);
          }
        });
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.error = 'Failed to load games. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadPrediction(game: GameDto): void {
    if (!game.homeTeamId || !game.awayTeamId) {
      console.warn('Cannot load prediction: Missing team IDs');
      return;
    }
    
    this.predictionLoading[game.matchId] = true;
    
    this.gameService.getPrediction(game.homeTeamId, game.awayTeamId).subscribe({
      next: (predictionData) => {
        // Log the raw prediction data
        console.log(`Loaded prediction for game ${game.matchId}:`, predictionData);
        
        // Ensure probabilities are valid (between 0 and 1)
        const normalizedPrediction = {
          ...predictionData,
          homeWinProbability: Math.max(0, Math.min(1, predictionData.homeWinProbability)),
          drawProbability: Math.max(0, Math.min(1, predictionData.drawProbability)),
          awayWinProbability: Math.max(0, Math.min(1, predictionData.awayWinProbability))
        };
        
        // Update the game with normalized prediction data
        const gameIndex = this.games.findIndex(g => g.matchId === game.matchId);
        if (gameIndex !== -1) {
          this.games[gameIndex].prediction = normalizedPrediction;
          this.applyFilters(); // Refresh filtered games
        }
        this.predictionLoading[game.matchId] = false;
      },
      error: (err) => {
        console.error(`Error loading prediction for game ${game.matchId}:`, err);
        this.predictionLoading[game.matchId] = false;
      }
    });
  }

  getPredictionClass(probability: number): string {
    if (probability >= 0.6) return 'high-probability';
    if (probability >= 0.3) return 'medium-probability';
    return 'low-probability';
  }
  
  // Format the predicted score from goals
  getPredictedScore(prediction: MatchPrediction): string {
    if (prediction.predictedHomeGoals !== undefined && prediction.predictedAwayGoals !== undefined) {
      return `${prediction.predictedHomeGoals} - ${prediction.predictedAwayGoals}`;
    }
    return '';
  }

  applyFilters(): void {
    // First filter by status if selected
    let result = this.games;
    
    if (this.statusFilter !== 'ALL') {
      result = this.games.filter(game => game.status === this.statusFilter);
    }
    
    // Then apply search term if any
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(game => 
        game.homeTeamName?.toLowerCase().includes(term) || 
        game.awayTeamName?.toLowerCase().includes(term) ||
        new Date(game.matchDate).toLocaleDateString().includes(term)
      );
    }
    
    this.filteredGames = result;
    this.totalItems = this.filteredGames.length;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  viewGameDetails(gameId: number): void {
    console.log('Navigating to game details for game ID:', gameId);
    this.router.navigate(['/games/detail', gameId]);
  }

  editGame(gameId: number): void {
    this.router.navigate(['/games/edit', gameId]);
  }

  deleteGame(gameId: number): void {
    if (confirm('Are you sure you want to delete this game?')) {
      this.loading = true;
      this.gameService.deleteGame(gameId).subscribe({
        next: () => {
          this.games = this.games.filter(g => g.matchId !== gameId);
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error deleting game:', err);
          this.error = 'Failed to delete game. Please try again later.';
          this.loading = false;
        }
      });
    }
  }

  addNewGame(): void {
    this.router.navigate(['/games/add']);
  }

  // Updates status of all games (e.g., scheduled games that should now be live)
  updateAllGameStatuses(): void {
    this.loading = true;
    this.gameService.getAllGames().subscribe({
      next: (gamesResponse) => {
        console.log('Loaded games:', gamesResponse);
        
        // Transform the response to match our GameDto interface
        this.games = gamesResponse.map(game => {
          // Extract team information from gameSheet if available
          const homeTeamName = game.gameSheet?.homeTeam?.teamName || 'Unknown Team';
          const awayTeamName = game.gameSheet?.awayTeam?.teamName || 'Unknown Team';
          const homeTeamId = game.gameSheet?.homeTeam?.teamId;
          const awayTeamId = game.gameSheet?.awayTeam?.teamId;
          
          return {
            ...game,
            homeTeamName,
            awayTeamName,
            homeTeamId,
            awayTeamId
          };
        });
        
        this.applyFilters();
        this.loading = false;
        
        // Load predictions for scheduled games
        this.games.forEach(game => {
          if (game.status === GameStatus.SCHEDULED && game.homeTeamId && game.awayTeamId) {
            this.loadPrediction(game);
          }
        });
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.error = 'Failed to load games. Please try again later.';
        this.loading = false;
      }
    });
  }

  // Update a single game's status
  updateGameStatus(gameId: number, status: GameStatus): void {
    this.loading = true;
    this.gameService.updateGameStatus(gameId, status).subscribe({
      next: (updatedGame) => {
        // Find and update the game in our array
        const index = this.games.findIndex(g => g.matchId === gameId);
        if (index !== -1) {
          this.games[index] = updatedGame;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating game status:', err);
        this.error = 'Failed to update game status. Please try again later.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: GameStatus): string {
    switch (status) {
      case GameStatus.SCHEDULED: return 'badge bg-info';
      case GameStatus.LIVE: return 'badge bg-success';
      case GameStatus.FINISHED: return 'badge bg-secondary';
      default: return 'badge bg-light';
    }
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }
}