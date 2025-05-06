import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../../services/game.service';
import { TeamService } from '../../../services/team.service';
import { Game, GameDto, GameStatus } from '../../../Models/Game';
import { TeamDto } from '../../../Models/Team';

@Component({
  selector: 'app-game-form',
  templateUrl: './game-form.component.html',
  styleUrls: ['./game-form.component.css']
})
export class GameFormComponent implements OnInit {
  gameForm: FormGroup;
  isEditMode = false;
  gameId: number = 0;
  loading = false;
  submitting = false;
  error = '';
  successMessage = '';
  teams: TeamDto[] = [];
  gameStatuses = Object.values(GameStatus);

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadTeams();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.gameId = +params['id'];
        this.isEditMode = true;
        this.loadGame();
      }
    });
  }

  createForm(): FormGroup {
    const today = new Date();
    return this.fb.group({
      matchDate: [today.toISOString().substr(0, 16), Validators.required],
      status: [GameStatus.SCHEDULED, Validators.required],
      durationMinutes: [90, [Validators.required, Validators.min(1)]],
      homeTeamId: [null, Validators.required],
      awayTeamId: [null, Validators.required]
    });
  }

  loadTeams(): void {
    this.loading = true;
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        this.error = 'Failed to load teams. Please refresh the page.';
        this.loading = false;
      }
    });
  }

  loadGame(): void {
    this.loading = true;
    this.gameService.getGameById(this.gameId).subscribe({
      next: (game) => {
        // Format the date to be compatible with input[type=datetime-local]
        const matchDate = new Date(game.matchDate);
        const formattedDate = matchDate.toISOString().substr(0, 16);
        
        // Find the team IDs from the team names
        const homeTeamId = game.homeTeamName ? this.findTeamIdByName(game.homeTeamName) : null;
        const awayTeamId = game.awayTeamName ? this.findTeamIdByName(game.awayTeamName) : null;
        
        this.gameForm.patchValue({
          matchDate: formattedDate,
          status: game.status,
          durationMinutes: game.durationMinutes,
          homeTeamId: homeTeamId,
          awayTeamId: awayTeamId
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading game:', err);
        this.error = `Failed to load game: ${err.status === 0 
          ? 'Server connection error' 
          : err.error?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  findTeamIdByName(teamName: string): number | null {
    const team = this.teams.find(t => t.teamName === teamName);
    return team ? (team.teamId ? team.teamId : null) : null;
  }

  // Method to get team name by team ID
  getTeamName(teamId: any): string {
    if (!teamId) return 'Unknown Team';
    const team = this.teams.find(t => t.teamId == teamId);
    return team ? team.teamName : 'Unknown Team';
  }

  onSubmit(): void {
    if (this.gameForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.gameForm.controls).forEach(key => {
        this.gameForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formValue = this.gameForm.value;
    
    // Convert form value to game object
    const game: Game = {
      matchDate: formValue.matchDate,
      status: formValue.status,
      durationMinutes: formValue.durationMinutes
    };

    // Get the homeTeamId and awayTeamId from the form
    const homeTeamId = formValue.homeTeamId;
    const awayTeamId = formValue.awayTeamId;

    if (this.isEditMode) {
      // Update existing game
      this.gameService.updateGame(this.gameId, game).subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = 'Game successfully updated!';
          setTimeout(() => {
            this.router.navigate(['/games']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error updating game:', err);
          this.error = `Failed to update game: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.submitting = false;
        }
      });
    } else {
      console.log('Creating new game with homeTeamId:', homeTeamId, 'and awayTeamId:', awayTeamId);
      // Create new game with team IDs as path variables
      this.gameService.addGame(game, homeTeamId, awayTeamId).subscribe({
        next: (response) => {
          this.submitting = false;
          this.successMessage = 'Game successfully created!';
          setTimeout(() => {
            this.router.navigate(['/games']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error creating game:', err);
          this.error = `Failed to create game: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.submitting = false;
        }
      });
    }
  }

  // Helper function to check if teams selected are different
  areTeamsDifferent(): boolean {
    const homeTeamId = this.gameForm.get('homeTeamId')?.value;
    const awayTeamId = this.gameForm.get('awayTeamId')?.value;
    return homeTeamId !== awayTeamId;
  }

  // Use this to show validation errors
  getFieldError(fieldName: string): string {
    const control = this.gameForm.get(fieldName);
    
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['min']) {
        return `Value must be greater than ${control.errors['min'].min}`;
      }
    }
    
    return '';
  }

  // Check if the teams selected are the same
  checkTeamsNotSame(): boolean {
    const homeTeamId = this.gameForm.get('homeTeamId')?.value;
    const awayTeamId = this.gameForm.get('awayTeamId')?.value;
    
    if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
      return false;
    }
    
    return true;
  }

  getTeamSameError(): string {
    if (!this.checkTeamsNotSame()) {
      return 'Home team and away team cannot be the same';
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/games']);
  }
}