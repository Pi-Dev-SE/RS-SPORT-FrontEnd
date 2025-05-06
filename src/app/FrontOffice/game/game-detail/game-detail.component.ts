import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../../services/game.service';
import { GameSheetService } from '../../../services/game-sheet.service';
import { GameDto, GameStatus } from '../../../Models/Game';
import { GameSheet } from '../../../Models/GameSheet';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.css']
})
export class GameDetailComponent implements OnInit {
  gameId: number = 0;
  game: GameDto | null = null;
  gameSheet: GameSheet | null = null;
  loading = false;
  error = '';
  GameStatus = GameStatus; // For use in template

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private gameSheetService: GameSheetService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.gameId = +params['id'];
        this.loadGameDetails();
      } else {
        this.error = 'No game ID provided';
      }
    });
  }
  getStatusIcon(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'fa-clock';
      case 'LIVE':
        return 'fa-play-circle';
      case 'FINISHED':
        return 'fa-flag-checkered';
      default:
        return 'fa-question-circle';
    }}
  loadGameDetails(): void {
    this.loading = true;
    this.gameService.getGameById(this.gameId).subscribe({
      next: (game) => {
        this.game = game;
        
        // If there's a game sheet associated with this game, load it
        if (game.gameSheetId) {
          this.loadGameSheet(game.gameSheetId);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading game details:', err);
        this.error = `Failed to load game details: ${err.status === 0 
          ? 'Server connection error' 
          : err.error?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  loadGameSheet(gameSheetId: number): void {
    this.gameSheetService.getGameSheetById(gameSheetId).subscribe({
      next: (gameSheet) => {
        this.gameSheet = gameSheet;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading game sheet:', err);
        this.loading = false;
        // We don't set an error here since it's optional data
      }
    });
  }

  editGame(): void {
    this.router.navigate(['/games/edit', this.gameId]);
  }

  deleteGame(): void {
    if (confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      this.loading = true;
      this.gameService.deleteGame(this.gameId).subscribe({
        next: () => {
          this.router.navigate(['/games']);
        },
        error: (err) => {
          console.error('Error deleting game:', err);
          this.error = `Failed to delete game: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  updateGameStatus(status: GameStatus): void {
    this.loading = true;
    this.gameService.updateGameStatus(this.gameId, status).subscribe({
      next: (updatedGame) => {
        this.game = updatedGame;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating game status:', err);
        this.error = `Failed to update game status: ${err.status === 0 
          ? 'Server connection error' 
          : err.error?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  createGameSheet(): void {
    this.router.navigate(['/game-sheets/add', this.gameId]);
  }

  viewGameSheet(): void {
    if (this.game && this.game.gameSheetId) {
      this.router.navigate(['/game-sheets/detail', this.game.gameSheetId]);
    }
  }

  editGameSheet(): void {
    if (this.game && this.game.gameSheetId) {
      this.router.navigate(['/game-sheets/edit', this.game.gameSheetId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }

  getStatusClass(status: GameStatus): string {
    switch (status) {
      case GameStatus.SCHEDULED: return 'badge bg-info';
      case GameStatus.LIVE: return 'badge bg-success';
      case GameStatus.FINISHED: return 'badge bg-secondary';
      default: return 'badge bg-light';
    }
  }
}