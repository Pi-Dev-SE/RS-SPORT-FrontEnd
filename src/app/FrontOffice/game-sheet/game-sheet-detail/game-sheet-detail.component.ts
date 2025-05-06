import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GameSheetService } from '../../../services/game-sheet.service';
import { GameSheet, GameSheetResponse } from '../../../Models/GameSheet';
import { Player } from '../../player/models/player.model';

@Component({
  selector: 'app-game-sheet-detail',
  templateUrl: './game-sheet-detail.component.html',
  styleUrls: ['./game-sheet-detail.component.css']
})
export class GameSheetDetailComponent implements OnInit {

  gameSheetId: number = 0;
  gameSheet: GameSheet | null = null;
  homeTeamPlayers: Player[] = [];
  awayTeamPlayers: Player[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameSheetService: GameSheetService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.gameSheetId = +params['id'];
        console.log('Game Sheet ID:', this.gameSheetId);
        this.loadGameSheetDetails();
      } else {
        this.error = 'No game sheet ID provided';
      }
    });
  }

  loadGameSheetDetails(): void {
    this.loading = true;
    this.gameSheetService.getGameSheetById(this.gameSheetId).subscribe({
      next: (gameSheet) => {
        console.log('Game Sheet Details:', gameSheet);
        this.gameSheet = gameSheet;
        
        // Load the full response to get player information
        this.http.get<{gameSheet: GameSheet, homeTeamPlayers: Player[], awayTeamPlayers: Player[]}>
          (`${this.gameSheetService['baseUrl']}/getgamecard/${this.gameSheetId}`).subscribe({
            next: (fullResponse) => {
              this.homeTeamPlayers = fullResponse.homeTeamPlayers || [];
              this.awayTeamPlayers = fullResponse.awayTeamPlayers || [];
              console.log('Home Players:', this.homeTeamPlayers);
              console.log('Away Players:', this.awayTeamPlayers);
              this.loading = false;
            },
            error: (err) => {
              console.error('Error loading player details:', err);
              this.loading = false;
            }
          });
      },
      error: (err) => {
        console.error('Error loading game sheet details:', err);
        this.error = `Failed to load game sheet details: ${err.status === 0 
          ? 'Server connection error' 
          : err.error?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  editGameSheet(): void {
    this.router.navigate(['/game-sheets/edit', this.gameSheetId]);
  }

  deleteGameSheet(): void {
    if (confirm('Are you sure you want to delete this game sheet? This action cannot be undone.')) {
      this.loading = true;
      this.gameSheetService.deleteGameSheet(this.gameSheetId).subscribe({
        next: () => {
          this.router.navigate(['/game-sheets']);
        },
        error: (err) => {
          console.error('Error deleting game sheet:', err);
          this.error = `Failed to delete game sheet: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/game-sheets']);
  }

  calculateWinner(): string {
    if (!this.gameSheet) return '';
    
    if (this.gameSheet.homegoal > this.gameSheet.awaygoal) {
      return 'home';
    } else if (this.gameSheet.homegoal < this.gameSheet.awaygoal) {
      return 'away';
    } else {
      return 'draw';
    }
  }

  getWinnerName(): string {
    const winner = this.calculateWinner();
    if (!this.gameSheet) return '';
    
    if (winner === 'home') {
      return this.gameSheet.homeTeam?.teamName|| 'Home Team';
    } else if (winner === 'away') {
      return this.gameSheet.awayTeam?.teamName || 'Away Team';
    } else {
      return 'Draw';
    }
  }

  getScoreClass(): string {
    const winner = this.calculateWinner();
    return winner === 'draw' ? 'text-info' : (winner === 'home' ? 'text-success' : 'text-danger');
  }

  calculatePossessionBarWidth(possession: number): string {
    return `${possession}%`;
  }

  // Add parseInt method to handle the conversion of string to number
  parseInt(value: string): number {
    return parseInt(value, 10);
  }
}