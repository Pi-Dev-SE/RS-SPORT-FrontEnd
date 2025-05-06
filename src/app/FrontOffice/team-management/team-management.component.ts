import { Component, OnInit, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { Team, TeamDto } from '../../Models/Team';
import { CATEGORIE } from '../../Models/categorie.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { PlayerService } from '../player/services/player.service';
import { Player } from '../player/models/player.model';
import { CoachService } from '../coach/services/coach.service';
import { Coach } from '../coach/models/coach.model';

@Component({
  selector: 'app-team-management',
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.css']
})
export class TeamManagementComponent implements OnInit {
  clubId: number = 0;
  teamForm: FormGroup;
  categories = Object.values(CATEGORIE);
  isLoading = false;
  error = '';
  successMessage = '';
  teams: TeamDto[] = [];
  
  // For club information
  clubName: string = 'Club';
  
  // For player and coach management
  availablePlayers: any[] = [];
  availableCoaches: Coach[] = [];
  selectedTeamId: number | null = null;
  
  // For player assignment
  clubPlayers: any[] = [];
  loadingClubPlayers = false;
  displayPlayersList = false;
  selectedTeamForPlayers: any = null;
  
  // For coach assignment
  loadingClubCoaches = false;
  displayCoachesList = false;
  selectedTeamForCoach: any = null;
  
  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router,
    private injector: Injector,
    private playerService: PlayerService,
    private coachService: CoachService
  ) {
    this.teamForm = this.fb.group({
      teamName: ['', [Validators.required, Validators.minLength(3)]],
      categorie: [CATEGORIE.Seniors, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.clubId = +idParam;
        this.loadTeams();
        
        // We could also load club details here if needed
        // this.loadClubDetails();
      }
    });
  }

  loadTeams(): void {
    if (!this.clubId) return;
    
    this.isLoading = true;
    this.teamService.getTeamsByClubId(this.clubId).subscribe({
      next: (teams) => {
        this.teams = teams;
        // If we have teams, we can update the club name from the first team
        if (teams.length > 0 && teams[0].clubName) {
          this.clubName = teams[0].clubName;
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading teams:', err);
        this.error = `Failed to load teams: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      this.markFormGroupTouched(this.teamForm);
      return;
    }

    this.isLoading = true;
    const newTeam: Team = {
      teamName: this.teamForm.value.teamName,
      categorie: this.teamForm.value.categorie
    };

    this.teamService.addTeam(newTeam, this.clubId).subscribe({
      next: (team) => {
        this.successMessage = `Team "${team.teamName}" was successfully added!`;
        this.teamForm.reset({
          categorie: CATEGORIE.Seniors
        });
        this.loadTeams();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error adding team:', err);
        this.error = `Failed to add team: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  editTeam(teamId: number | undefined): void {
    if (teamId) {
      // Pass the club ID as state when navigating to team form
      this.router.navigate(['/team-form', teamId], {
        state: { clubId: this.clubId }
      });
    } else {
      this.error = 'Cannot edit team: Missing team ID';
    }
  }

  viewTeamDetails(teamId: number | undefined,
    clubId: number | undefined
  ): void {
    if (teamId) {
      this.router.navigate(['/team-detail', teamId, clubId]);
    } else {
      this.error = 'Cannot view team details: Missing team ID';
    }
  }

  deleteTeam(teamId: number | undefined): void {
    if (!teamId) {
      this.error = 'Cannot delete team: Missing team ID';
      return;
    }
    
    if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      this.isLoading = true;
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          this.successMessage = 'Team was successfully deleted!';
          this.loadTeams();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting team:', err);
          this.error = `Failed to delete team: ${err.message || 'Unknown error'}`;
          this.isLoading = false;
        }
      });
    }
  }

  // Load players directly from a specific team
  loadTeamPlayers(teamId: number): void {
    this.isLoading = true;
    this.teamService.getTeamPlayers(teamId).subscribe({
      next: (players) => {
        console.log(`Players for team ${teamId} loaded:`, players);
        // Update the players list for the selected team
        const teamIndex = this.teams.findIndex(t => t.teamId === teamId);
        if (teamIndex !== -1) {
          this.teams[teamIndex].players = players;
          this.teams[teamIndex].playerCount = players.length;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(`Error loading players for team ${teamId}:`, err);
        this.error = `Failed to load team players: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  // Load players by club ID for assignment to teams
  loadClubPlayers(): void {
    this.loadingClubPlayers = true;
    
    // Import PlayerService if not already imported
    const playerService = this.injector.get(PlayerService);
    
    playerService.getPlayersByClubId(this.clubId).subscribe({
      next: (players) => {
        console.log('Club players loaded:', players);
        this.clubPlayers = players;
        this.loadingClubPlayers = false;
      },
      error: (err) => {
        console.error(`Error loading players for club ${this.clubId}:`, err);
        this.error = `Failed to load club players: ${err.message || 'Unknown error'}`;
        this.loadingClubPlayers = false;
      }
    });
  }
  
  // Open player assignment modal for a specific team
  openPlayerAssignment(team: TeamDto): void {
    this.selectedTeamForPlayers = team;
    this.displayPlayersList = true;
    
    // If players aren't loaded yet, load them
    if (this.clubPlayers.length === 0) {
      this.loadClubPlayers();
    }
  }
  
  // Assign a player to the selected team
  assignPlayerToTeam(playerId: number): void {
    if (!this.selectedTeamForPlayers || !this.selectedTeamForPlayers.teamId) {
      this.error = 'No team selected for player assignment';
      return;
    }
    
    this.isLoading = true;
    
    this.teamService.assignPlayerToTeam(playerId, this.selectedTeamForPlayers.teamId).subscribe({
      next: (updatedTeam) => {
        console.log('Player assigned successfully:', updatedTeam);
        this.successMessage = 'Player successfully assigned to team!';
        
        // Update the team in our teams array
        const teamIndex = this.teams.findIndex(t => t.teamId === this.selectedTeamForPlayers?.teamId);
        if (teamIndex !== -1) {
          this.teams[teamIndex] = updatedTeam;
        }
        
        // Refresh the players in the selected team
        this.loadTeamPlayers(this.selectedTeamForPlayers.teamId);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error assigning player:', err);
        this.error = `Failed to assign player: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }
  
  // Close the player assignment modal
  closePlayersList(): void {
    this.displayPlayersList = false;
    this.selectedTeamForPlayers = null;
  }
  
  // Check if a player is already assigned to the selected team
  isPlayerInTeam(playerId: number): boolean {
    if (!this.selectedTeamForPlayers || !this.selectedTeamForPlayers.players) {
      return false;
    }
    
    return this.selectedTeamForPlayers.players.some((player: any) => player.id === playerId);
  }

  // Helper method to navigate back to clubs list
  goBackToClubs(): void {
    this.router.navigate(['/club']);
  }
  
  // Helper method to get CSS class for category badge
  getCategoryClass(category: CATEGORIE): string {
    switch(category) {
      case CATEGORIE.Seniors: return 'bg-danger';
      case CATEGORIE.Juniors: return 'bg-success';
      case CATEGORIE.Cadette: return 'bg-info';
      case CATEGORIE.Minimes: return 'bg-warning';
      case CATEGORIE.Féminin: return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  // Helper function to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  // === Coach Assignment Methods ===
  
  // Load coaches by club ID for assignment to teams
  loadClubCoaches(): void {
    this.loadingClubCoaches = true;
    
    this.coachService.getCoachesByClubId(this.clubId).subscribe({
      next: (coaches) => {
        console.log('Club coaches loaded:', coaches);
        this.availableCoaches = coaches;
        this.loadingClubCoaches = false;
      },
      error: (err) => {
        console.error(`Error loading coaches for club ${this.clubId}:`, err);
        this.error = `Failed to load club coaches: ${err.message || 'Unknown error'}`;
        this.loadingClubCoaches = false;
      }
    });
  }
  
  // Open coach assignment modal for a specific team
  openCoachAssignment(team: TeamDto): void {
    this.selectedTeamForCoach = team;
    this.displayCoachesList = true;
    
    // If coaches aren't loaded yet, load them
    if (this.availableCoaches.length === 0) {
      this.loadClubCoaches();
    }
  }
  
  // Assign a coach to the selected team
  assignCoachToTeam(coachId: number): void {
    if (!this.selectedTeamForCoach || !this.selectedTeamForCoach.teamId) {
      this.error = 'No team selected for coach assignment';
      return;
    }
    
    this.isLoading = true;
    
    this.teamService.assignCoachToTeam(coachId, this.selectedTeamForCoach.teamId).subscribe({
      next: (updatedTeam) => {
        console.log('Coach assigned successfully:', updatedTeam);
        this.successMessage = 'Coach successfully assigned to team!';
        
        // Update the team in our teams array
        const teamIndex = this.teams.findIndex(t => t.teamId === this.selectedTeamForCoach?.teamId);
        if (teamIndex !== -1) {
          this.teams[teamIndex] = updatedTeam;
        }
        
        // Close the modal after successful assignment
        this.closeCoachesList();
        
        // Refresh all teams to see the updated coach assignment
        this.loadTeams();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error assigning coach:', err);
        this.error = `Failed to assign coach: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }
  
  // Close the coach assignment modal
  closeCoachesList(): void {
    this.displayCoachesList = false;
    this.selectedTeamForCoach = null;
  }
  
  // Check if a coach is already assigned to the selected team
  isCoachAssignedToTeam(coachId: number): boolean {
    if (!this.selectedTeamForCoach) {
      return false;
    }
    
    return this.selectedTeamForCoach.coachId === coachId;
  }
  
  // Returns CSS class based on form control state
  getInputClass(controlName: string) {
    const control = this.teamForm.get(controlName);
    if (control?.touched) {
      return control.valid ? 'is-valid' : 'is-invalid';
    }
    return '';
  }
  
  // Returns feedback message for invalid form controls
  getErrorMessage(controlName: string): string {
    const control = this.teamForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.getError('minlength').requiredLength} characters`;
    }
    return '';
  }
}