import { Component, OnInit } from '@angular/core';
import { TeamService } from '../../services/team.service';
import { Team, TeamDto } from '../../Models/Team';
import { CATEGORIE } from '../../Models/categorie.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PlayerService } from '../player/services/player.service';
import { Player } from '../player/models/player.model';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  teams: TeamDto[] = [];
  selectedClubId: number = 0;
  clubId: number = 0;
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';
  categories = Object.values(CATEGORIE);
  
  // For player data
  players: Player[] = [];
  loadingPlayers: boolean = false;
  
  // For pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  
  // Club options - in a real app, you would fetch this from a club service
  clubOptions = [
    { id: 1, name: 'FC Barcelona' },
    { id: 2, name: 'Real Madrid' },
    { id: 3, name: 'Bayern Munich' }
  ];

  constructor(
    private teamService: TeamService,
    private router: Router,
    private route: ActivatedRoute,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    // Check if club ID is in route params
    this.route.params.subscribe(params => {
      if (params['idclub']) {
        this.clubId = +params['idclub'];
        this.selectedClubId = this.clubId;
        console.log('Club ID from route params:', this.clubId);
        
        // Load teams and players for this club
        this.loadTeams();
        this.loadPlayersByClubId();
      } else {
        // Check localStorage for saved club ID if not in route
        const savedClubId = localStorage.getItem('selectedClubId');
        if (savedClubId) {
          this.selectedClubId = parseInt(savedClubId);
          this.loadTeams();
        }
      }
    });
  }

  loadTeams(): void {
    if (!this.selectedClubId) return;
    
    this.loading = true;
    this.error = '';
    
    localStorage.setItem('selectedClubId', this.selectedClubId.toString());
    
    this.teamService.getTeamsByClubId(this.selectedClubId)
      .subscribe({
        next: (data) => {
          this.teams = data;
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error fetching teams:', err);
          this.error = `Failed to load teams: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
  }

  onClubChange(): void {
    this.loadTeams();
  }

  viewTeamDetails(teamId: number | undefined): void {
    if (teamId) {
      this.router.navigate(['/team-detail', teamId]);
    } else {
      this.error = 'Cannot view team: Invalid team ID';
    }
  }

  editTeam(teamId: number | undefined): void {
    if (teamId) {
      this.router.navigate(['/team-form', teamId]);
    } else {
      this.error = 'Cannot edit team: Invalid team ID';
    }
  }

  deleteTeam(teamId: number | undefined): void {
    if (!teamId) {
      this.error = 'Cannot delete team: Invalid team ID';
      return;
    }
    
    if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      this.loading = true;
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          this.teams = this.teams.filter(team => team.teamId !== teamId);
          this.successMessage = 'Team successfully deleted!';
          setTimeout(() => this.successMessage = '', 3000);
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting team:', err);
          this.error = `Failed to delete team: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  addNewTeam(): void {
    // Save selected club ID to pre-populate the form
    localStorage.setItem('selectedClubId', this.selectedClubId.toString());
    this.router.navigate(['/team-form']);
  }

  getCategoryString(category: CATEGORIE): string {
    return category.toString();
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
  
  // Pagination methods
  getTotalPages(): number {
    return Math.ceil(this.teams.length / this.itemsPerPage);
  }
  
  getPageNumbers(): number[] {
    const pageCount = this.getTotalPages();
    const visiblePages = Math.min(5, pageCount);
    const pages: number[] = [];
    
    // Calculate start page
    let startPage = Math.max(1, this.currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(pageCount, startPage + visiblePages - 1);
    
    // Adjust start page if we're near the end
    startPage = Math.max(1, endPage - visiblePages + 1);
    
    // Generate page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Load players belonging to the selected club
  loadPlayersByClubId(): void {
    if (!this.clubId) return;
    
    this.loadingPlayers = true;
    this.playerService.getPlayersByClubId(this.clubId).subscribe({
      next: (players) => {
        this.players = players;
        console.log(`Loaded ${players.length} players for club ID ${this.clubId}:`, players);
        this.loadingPlayers = false;
      },
      error: (err) => {
        console.error(`Error loading players for club ${this.clubId}:`, err);
        this.error = `Failed to load players: ${err.message || 'Unknown error'}`;
        this.loadingPlayers = false;
      }
    });
  }
}