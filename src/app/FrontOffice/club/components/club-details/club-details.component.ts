import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubService } from '../../services/club.service';
import { Club } from '../../models/club.model';
import { PlayerService } from '../../../player/services/player.service';
import { Player, TypeStatusHealth } from '../../../player/models/player.model';
import { CoachService } from '../../../coach/services/coach.service';
import { Coach } from '../../../coach/models/coach.model';
import { TeamService } from '../../../../services/team.service';
import { TeamDto } from '../../../../Models/Team';
import { CATEGORIE } from '../../../../Models/categorie.enum';

@Component({
  selector: 'app-club-details',
  templateUrl: './club-details.component.html',
  styleUrls: ['./club-details.component.scss'],
})
export class ClubDetailsComponent implements OnInit {
  goToTeamManagement(): void {
    if (this.clubId) {
      // Navigate to the properly configured route in club.module.ts
      this.router.navigate(['/team-management', this.clubId]);
    }
  }
  club: Club | null = null;
  loading = false;
  clubId!: number;
  players: Player[] = [];
  coaches: Coach[] = [];
  teams: TeamDto[] = [];
  activeTab = 'info';
  loadingPlayers = false;
  loadingCoaches = false;
  loadingTeams = false;

  playerDetails: Player[] = [];
  selectedPlayer: any = null;
  viewingPlayerDetails = false;

  selectedCoach: any = null;
  viewingCoachDetails = false;

  playerIdToAdd: number | null = null;
  coachIdToAdd: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private playerService: PlayerService,
    private coachService: CoachService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.clubId = +params['id'];

        const storedClub = this.clubService.getCurrentClub();

        if (storedClub && storedClub.clubId === this.clubId) {
          this.club = storedClub;
          this.loading = false;
          this.loadPlayersByClubId();
        } else {
          this.loadClubDetails(this.clubId);
        }
      }
    });
  }

  refreshClubData(): void {
    if (this.clubId) {
      this.loadClubDetails(this.clubId);
    }
  }

  loadClubDetails(clubId: number): void {
    this.loading = true;
    this.clubService.getClubById(clubId).subscribe({
      next: (data) => {
        console.log('Club details loaded:', data);
        this.club = data;
        this.loading = false;

        if (this.activeTab === 'players') {
          this.loadPlayersByClubId();
        }
        if (this.activeTab === 'coaches') {
          this.loadCoachesByClubId();
        }
      },
      error: (error) => {
        console.error('Error fetching club details:', error);
        this.loading = false;
      },
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'players' && this.players.length === 0) {
      this.loadPlayersByClubId();
    }
    if (tab === 'coaches' && this.coaches.length === 0) {
      console.log('Loading coaches for club:', this.clubId);
      this.loadCoachesByClubId();
    }
    if (tab === 'teams' && this.teams.length === 0) {
      this.loadTeamsByClubId();
    }
  }

  assignPlayer(): void {
    if (this.playerIdToAdd && this.clubId) {
      this.clubService
        .assignPlayerToClub(this.clubId, this.playerIdToAdd)
        .subscribe({
          next: () => {
            this.loadClubDetails(this.clubId);
            this.playerIdToAdd = null;
          },
          error: (err) => console.error('Error assigning player:', err),
        });
    }
  }

  assignCoach(): void {
    if (this.coachIdToAdd && this.clubId) {
      this.clubService
        .assignCoachToClub(this.clubId, this.coachIdToAdd)
        .subscribe({
          next: () => {      
            this.loadCoachesByClubId();
            this.coachIdToAdd = null;
          },
          error: (err) => console.error('Error assigning coach:', err),
        });
    }
  }

  removePlayer(playerId: number): void {
    if (confirm('Are you sure you want to remove this player from the club?')) {
      this.clubService.removePlayerFromClub(this.clubId, playerId).subscribe({
        next: () => this.players = this.players.filter(player => player.id !== playerId),
      });
    }
  }

  removeCoach(coachId: number): void {
    if (confirm('Are you sure you want to remove this coach from the club?')) {
      this.clubService.removeCoachFromClub(this.clubId, coachId).subscribe({
        next: () => {
          console.log('Coach removed successfully');
          this.coaches = this.coaches.filter(coach => coach.id !== coachId);
        },
        error: (err) => console.error('Error removing coach:', err),
      });
    }
  }

  updatePlayerClub(playerId: number, newClubId: number): void {
    this.clubService.updatePlayerClub(playerId, newClubId).subscribe({
      next: () => this.loadClubDetails(this.clubId),
      error: (err) => console.error('Error updating player club:', err),
    });
  }

  updateCoachClub(coachId: number, newClubId: number): void {
    this.clubService.updateCoachClub(coachId, newClubId).subscribe({
      next: () => this.loadClubDetails(this.clubId),
      error: (err) => console.error('Error updating coach club:', err),
    });
  }

  goBack(): void {
    this.router.navigate(['/club/clubs']);
  }

  loadPlayersByClubId(): void {
    this.loadingPlayers = true;
    this.playerService.getPlayersByClubId(this.clubId).subscribe({
      next: (players) => {
        this.players = players;
        this.loadingPlayers = false;
        console.log('Players loaded:', players);
      },
      error: (err) => {
        console.error(`Error loading players for club ${this.clubId}:`, err);
        this.loadingPlayers = false;
      },
    });
  }

  loadCoachesByClubId(): void {
    this.loadingCoaches = true;
    this.coachService.getCoachesByClubId(this.clubId).subscribe({
      next: (coaches) => {
        this.coaches = coaches;
        this.loadingCoaches = false;
        console.log('Coaches loaded:', coaches);
      },
      error: (err) => {
        console.error(`Error loading coaches for club ${this.clubId}:`, err);
        this.loadingCoaches = false;
      },
    });
  }

  loadTeamsByClubId(): void {
    this.loadingTeams = true;
    this.teamService.getTeamsByClubId(this.clubId).subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loadingTeams = false;
        console.log('Teams loaded:', teams);
      },
      error: (err) => {
        console.error(`Error loading teams for club ${this.clubId}:`, err);
        this.loadingTeams = false;
      }
    });
  }

  viewTeamDetails(teamId: number | undefined): void {
    if (teamId) {
      this.router.navigate(['/team-detail', teamId, this.clubId]);
    }
  }

  editTeam(teamId: number | undefined): void {
    if (teamId) {
      this.router.navigate(['/team-form', teamId], {
        state: { clubId: this.clubId }
      });
    }
  }

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

  viewPlayerDetails(player: Player): void {
    this.selectedPlayer = player;
    this.viewingPlayerDetails = true;
  }

  closePlayerDetails(): void {
    this.selectedPlayer = null;
    this.viewingPlayerDetails = false;
  }

  viewCoachDetails(coach: Coach): void {
    this.selectedCoach = coach;
    this.viewingCoachDetails = true;
  }

  closeCoachDetails(): void {
    this.selectedCoach = null;
    this.viewingCoachDetails = false;
  }

  getStatusDisplay(status: string): string {
    if (!status) return 'Unknown';

    if (status === 'Active' || status === 'Injured' || status === 'Recovering') {
      return status;
    }

    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  getFullName(player: any): string {
    return `${player.firstname || ''} ${player.lastname || ''}`.trim() || 'Unknown';
  }

  goToPlayerManagement(): void {
    this.router.navigate(['/players'], { 
      queryParams: { clubId: this.clubId }
    });
  }
  goToCoachManagement(): void {
    this.router.navigate(['/coaches'], { 
      queryParams: { clubId: this.clubId }
    });
  }
  editClub(clubId: number): void { 
    const club = this.club && this.club.clubId === clubId ? this.club : null;
    
    if (club) {
      this.clubService.setCurrentClub(club);
      this.router.navigate(['/club/edit-club', clubId], { 
        queryParams: { useStoredData: true }
      });
    } else {
      this.router.navigate(['/club/edit-club', clubId]);
    }
  }
}
