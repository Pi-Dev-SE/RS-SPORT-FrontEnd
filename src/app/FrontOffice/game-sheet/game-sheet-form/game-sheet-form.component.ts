import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameSheetService } from '../../../services/game-sheet.service';
import { GameService } from '../../../services/game.service';
import { GameSheet } from '../../../Models/GameSheet';
import { GameDto } from '../../../Models/Game';
import { TeamDto } from '../../../Models/Team';
import { TeamService } from '../../../services/team.service';

@Component({
  selector: 'app-game-sheet-form',
  templateUrl: './game-sheet-form.component.html',
  styleUrls: ['./game-sheet-form.component.css']
})
export class GameSheetFormComponent implements OnInit {
  gameSheetForm: FormGroup;
  isEditMode = false;
  gameSheetId: number | null = null;
  gameId: number | null = null;
  game: GameDto | null = null;
  gameSheet: GameSheet | null = null;
  teams: TeamDto[] = [];
  loading = false;
  submitting = false;
  error = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private gameSheetService: GameSheetService,
    private gameService: GameService,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameSheetForm = this.createForm();
  }
  calculateConversionRate(team: 'home' | 'away'): number {
    const goals = team === 'home' ? this.gameSheetForm.get('homegoal')?.value || 0 : this.gameSheetForm.get('awaygoal')?.value || 0;
    const shots = team === 'home' ? this.gameSheetForm.get('homeshotOnGoal')?.value || 0 : this.gameSheetForm.get('awayshotOnGoal')?.value || 0;
    return shots > 0 ? Math.round((goals / shots) * 100) : 0;
  }
  ngOnInit(): void {
    this.loadTeams();
    
    // Check if we're editing an existing game sheet
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      if (params['id']) {
        console.log('Game Sheet ID from route params:', params['id']);
        this.gameSheetId = +params['id'];
        this.isEditMode = true;
        this.loadGameSheet();
      } else if (params['gameId']) {
        console.log('Game ID from route params:', params['gameId']);
        // We're creating a new game sheet for a specific game
        this.gameId = +params['gameId'];
        this.loadGame();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      homeTeamId: [{value: null, disabled: false}],
      awayTeamId: [{value: null, disabled: false}],
      homepossessionPercent: [50, [Validators.min(0), Validators.max(100)]],
      awaypossessionPercent: [50, [Validators.min(0), Validators.max(100)]],
      homegoal: [0, [Validators.min(0)]],
      awaygoal: [0, [Validators.min(0)]],
      homeshotOnGoal: [0, [Validators.min(0)]],
      awayshotOnGoal: [0, [Validators.min(0)]],
      homefouls: ['0'],
      awayfouls: ['0'],
      homenotes: [5, [Validators.min(0), Validators.max(10)]],
      awaynotes: [5, [Validators.min(0), Validators.max(10)]]
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
        this.error = 'Failed to load teams. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadGameSheet(): void {this.loading = true;
    this.gameSheetService.getGameSheetById(this.gameSheetId!).subscribe({
      next: (gameSheet) => {
        console.log('Loaded game sheet:', gameSheet);
        this.gameSheet = gameSheet;
        
        // Populate the form with game sheet data
        this.gameSheetForm.patchValue({
          homeTeamId: gameSheet.homeTeam?.teamId || null,
          awayTeamId: gameSheet.awayTeam?.teamId || null,
          homepossessionPercent: gameSheet.homepossessionPercent || 0,
          awaypossessionPercent: gameSheet.awaypossessionPercent || 0,
          homegoal: gameSheet.homegoal || 0,
          awaygoal: gameSheet.awaygoal || 0,
          homeshotOnGoal: gameSheet.homeshotOnGoal || 0,
          awayshotOnGoal: gameSheet.awayshotOnGoal || 0,
          homefouls: gameSheet.homefouls || '0',
          awayfouls: gameSheet.awayfouls || '0',
          homenotes: gameSheet.homenotes || 5,
          awaynotes: gameSheet.awaynotes || 5
        });
        
        // Disable team selection fields since they're already set
        this.gameSheetForm.get('homeTeamId')?.disable();
        this.gameSheetForm.get('awayTeamId')?.disable();
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading game sheet:', err);
        this.error = `Failed to load game sheet: ${err.status === 0 
          ? 'Server connection error' 
          : err.error?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });

    
  }

  loadGame(): void {
    console.log('Loading game for ID:', this.gameId);
    if (!this.gameId) {
      return;
    }
    
    this.loading = true;
    this.gameService.getGameById(this.gameId!).subscribe({
      next: (game) => {
        console.log('Loaded game:', game);
        // Store the game object in the component property so it's available in the template
        this.game = game;
        
        // Check if the game has a gameSheet object directly
        if (game.gameSheet && game.gameSheet.gameSheetId) {
          this.gameSheetId = game.gameSheet.gameSheetId;
          this.isEditMode = true;
          
          // Use gameSheet data directly from the game object
          const gameSheet = game.gameSheet;
          console.log('Game sheet data:', gameSheet);
          
          // Populate the form with gameSheet data - make sure to handle team IDs properly
          this.gameSheetForm.patchValue({
            homeTeamId: gameSheet.homeTeam?.teamId || null,
            awayTeamId: gameSheet.awayTeam?.teamId || null,
            homepossessionPercent: gameSheet.homepossessionPercent || 0,
            awaypossessionPercent: gameSheet.awaypossessionPercent || 0,
            homegoal: gameSheet.homegoal || 0,
            awaygoal: gameSheet.awaygoal || 0,
            homeshotOnGoal: gameSheet.homeshotOnGoal || 0,
            awayshotOnGoal: gameSheet.awayshotOnGoal || 0,
            homefouls: gameSheet.homefouls || '',
            awayfouls: gameSheet.awayfouls || '',
            homenotes: gameSheet.homenotes || 0,
            awaynotes: gameSheet.awaynotes || 0
          });
          
          // Using markAsDirty to ensure Angular detects the changes
          Object.keys(this.gameSheetForm.controls).forEach(key => {
            this.gameSheetForm.get(key)?.markAsDirty();
          });
          
          console.log('Game sheet data loaded:', this.gameSheetForm.value);
          
          // Disable team selection fields since they're already set
          this.gameSheetForm.get('homeTeamId')?.disable();
          this.gameSheetForm.get('awayTeamId')?.disable();
          
          this.loading = false;
        } 
        // Check if the game has a gameSheetId (meaning a gameSheet is associated with it)
        else if (game.gameSheetId) {
          // ...existing code...
        } 
        // If there's no gameSheetId but there are team names, pre-select those teams
        else if (game.homeTeamName && game.awayTeamName) {
          const homeTeam = this.teams.find(t => t.teamName === game.homeTeamName);
          const awayTeam = this.teams.find(t => t.teamName === game.awayTeamName);
          
          if (homeTeam) {
            this.gameSheetForm.get('homeTeamId')?.setValue(homeTeam.teamId);
            this.gameSheetForm.get('homeTeamId')?.disable();
          }
          
          if (awayTeam) {
            this.gameSheetForm.get('awayTeamId')?.setValue(awayTeam.teamId);
            this.gameSheetForm.get('awayTeamId')?.disable();
          }
          
          this.loading = false;
        } else {
          this.loading = false;
        }
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

  onAwayPossessionChange(): void {
    // Ensure home and away possession adds up to 100%
    const awayPossession = this.gameSheetForm.get('awaypossessionPercent')?.value || 0;
    this.gameSheetForm.get('homepossessionPercent')?.setValue(100 - awayPossession);
  }

  onHomePossessionChange(): void {
    // Ensure home and away possession adds up to 100%
    const homePossession = this.gameSheetForm.get('homepossessionPercent')?.value || 0;
    this.gameSheetForm.get('awaypossessionPercent')?.setValue(100 - homePossession);
  }

  onSubmit(): void {
    if (this.gameSheetForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.gameSheetForm.controls).forEach(key => {
        this.gameSheetForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    // Use getRawValue() to include disabled controls
    const formValue = this.gameSheetForm.getRawValue();
    
    // Create or update the game sheet
    if (this.isEditMode && this.gameSheetId) {
      // Update existing game sheet
      this.gameSheetService.updateGameSheet(this.gameSheetId, formValue).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Game sheet successfully updated!';
          setTimeout(() => {
            this.router.navigate(['/game-sheets']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error updating game sheet:', err);
          this.error = `Failed to update game sheet: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.submitting = false;
        }
      });
    } else {
      // Create new game sheet
      const newGameSheet = {
        ...formValue,
        gameId: this.gameId // Ensure gameId is included
      };
      
      // Use homeTeamId and awayTeamId from form values (including disabled fields)
      this.gameSheetService.addGameSheet(
        formValue.homeTeamId, 
        formValue.awayTeamId, 
        newGameSheet
      ).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Game sheet successfully created!';
          setTimeout(() => {
            this.router.navigate(['/game-sheets']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error creating game sheet:', err);
          this.error = `Failed to create game sheet: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.submitting = false;
        }
      });
    }
  }

  // Helper function to check if teams selected are different
  areTeamsDifferent(): boolean {
    const homeTeamId = this.gameSheetForm.get('homeTeamId')?.value;
    const awayTeamId = this.gameSheetForm.get('awayTeamId')?.value;
    return homeTeamId !== awayTeamId;
  }

  // Use this to show validation errors
  getFieldError(fieldName: string): string {
    const control = this.gameSheetForm.get(fieldName);
    
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['min']) {
        return `Value must be greater than or equal to ${control.errors['min'].min}`;
      }
      if (control.errors?.['max']) {
        return `Value must be less than or equal to ${control.errors['max'].max}`;
      }
    }
    
    return '';
  }

  // Check if the teams selected are the same
  checkTeamsNotSame(): boolean {
    const homeTeamId = this.gameSheetForm.get('homeTeamId')?.value;
    const awayTeamId = this.gameSheetForm.get('awayTeamId')?.value;
    
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
    if (this.gameId) {
      this.router.navigate(['/games/detail', this.gameId]);
    } else {
      this.router.navigate(['/game-sheets']);
    }
  }

  getTeamName(teamId: number): string {
    const team = this.teams.find(t => t.teamId === teamId);
    return team ? team.teamName : 'Unknown Team';
  }
}