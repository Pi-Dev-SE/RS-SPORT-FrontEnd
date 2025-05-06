import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { TeamDto } from '../../Models/Team';
import { CATEGORIE } from '../../Models/categorie.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError,  } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { PlayerService } from '../player/services/player.service';
import { Player } from '../player/models/player.model';
import { CoachService } from '../coach/services/coach.service';
import { Coach } from '../coach/models/coach.model';
import { TeamStatistics } from '../../Models/team-statistics.model';
import { TeamStatisticsService } from '../../services/team-statistics.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {
  teamId: number = 0;
  clubid: number = 0;
  team: TeamDto | null = null;
  loading: boolean = true;
  error: string = '';
  successMessage: string = '';
  selectedPlayerId: number = 0;
  newCoachId: number = 0;
  isBackendAvailable: boolean = true;
  
  // For storing players from club and team
  clubPlayers: Player[] = [];
  teamPlayers: Player[] = [];
  availablePlayers: any[] = [];
  loadingPlayers: boolean = false;
  
  // Sample data for coaches dropdown
  availableCoaches: Coach[] = [];

  // Team statistics
  teamStatistics: TeamStatistics[] = [];
  isAddingStats: boolean = false;
  isEditingStats: boolean = false;
  selectedStatistic: TeamStatistics | null = null;
  statsForm: FormGroup;
  statsChartData: any = {};
  statsLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private playerService: PlayerService,
    private coachService: CoachService,
    private teamStatsService: TeamStatisticsService,
    private fb: FormBuilder
  ) {
    this.statsForm = this.createStatsForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.teamId = +params['id'];
        
        // Get club ID from route if available
        if (params['idclub']) {
          this.clubid = +params['idclub'];
          console.log('Club ID from route params:', this.clubid);
        }
        
        this.loadTeamDetails();
      } else {
        this.error = 'No team ID provided';
        this.loading = false;
      }
    });
  }

  // Create a form for team statistics
  createStatsForm(): FormGroup {
    return this.fb.group({
      teamstaId: [null],
      performanceRate: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      totalWins: [0, [Validators.required, Validators.min(0)]],
      totalLosses: [0, [Validators.required, Validators.min(0)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      rankingPoints: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadTeamDetails(): void {
    this.loading = true;
    this.error = '';
    
    this.teamService.getTeamById(this.teamId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error loading team details:', err);
          this.isBackendAvailable = false;
          
          // Backend is unavailable, load mock data instead
          console.log('Backend unavailable, loading mock data');
          return of(this.getMockTeam());
        })
      )
      .subscribe({
        next: (teamData) => {
          console.log('Team data loaded:', teamData);
          
          // Apply intelligent data handling to fix incomplete responses
          this.team = this.checkAndFixIncompleteTeamData(teamData);
          
          // Load players directly from the team players endpoint
          this.loadTeamPlayersDirectly();
          
          // If we have a club ID from the route parameters, use that
          if (this.clubid > 0) {
            console.log('Using club ID from route parameters:', this.clubid);
            this.loadPlayersForComparison(this.clubid);
            this.loadCoachesForClub(this.clubid);
            
            // If there is a coach ID in the team data, fetch and display the correct coach info
            if (this.team && this.team.coachId) {
              this.updateCoachInfo(this.team.coachId);
            }
          } 
          // Fallback to the club ID from the team data if available
          else if (this.team && this.team.clubId) {
            console.log('Using club ID from team data:', this.team.clubId);
            this.loadPlayersForComparison(this.team.clubId);
            this.loadCoachesForClub(this.team.clubId);
            
            // If there is a coach ID in the team data, fetch and display the correct coach info
            if (this.team && this.team.coachId) {
              this.updateCoachInfo(this.team.coachId);
            }
          } else {
            console.warn('No club ID available, cannot load players for comparison');
            this.loading = false;
          }
          
          // Filter out coach if assigned
          this.updateAvailableCoaches();

          // Load team statistics
          this.loadTeamStatistics();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading team details:', err);
          this.error = `Failed to load team details: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
  }
  
  // Improved method to load players from the same club
  loadPlayersForComparison(clubId: number): void {
    console.log('Loading players for club ID:', clubId);
    this.loadingPlayers = true;
    
    // Load players from the same club using the getPlayersByClubId endpoint
    this.playerService.getPlayersByClubId(clubId).subscribe({
      next: (players) => {
        this.clubPlayers = players;
        console.log(`Loaded ${players.length} players from club ID ${clubId}`);
        
        // Now that we have all club players, filter out those already in the team
        this.updateAvailablePlayersFromClub();
        this.loadingPlayers = false;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error loading players for club ${clubId}:`, err);
        this.error = `Failed to load players from club: ${err.message || 'Unknown error'}`;
        this.loadingPlayers = false;
        this.loading = false;
      }
    });
  }
  
  updateAvailablePlayersFromClub(): void {
    // Start with all players from the club
    if (!this.clubPlayers || this.clubPlayers.length === 0) {
      console.warn('No club players available to filter');
      this.availablePlayers = [];
      return;
    }
    
    console.log(`Filtering ${this.clubPlayers.length} club players to show only those not in team`);
    
    if (!this.team || !this.team.players || this.team.players.length === 0) {
      // If no players in team yet, all club players are available
      this.availablePlayers = this.mapPlayersToDropdownFormat(this.clubPlayers);
      console.log(`No players in team yet, showing all ${this.availablePlayers.length} club players`);
      return;
    }
    
    // Get IDs of players already in the team
    const teamPlayerIds = this.team.players.map(p => p.id);
    console.log(`Team has ${teamPlayerIds.length} players already assigned`);
    
    // Filter club players to get only those not already in the team
    const availablePlayers = this.clubPlayers.filter(player => 
      !teamPlayerIds.includes(player.id)
    );
    
    // Map to the format needed for the dropdown
    this.availablePlayers = this.mapPlayersToDropdownFormat(availablePlayers);
    console.log(`${this.availablePlayers.length} players available to assign to this team`);
  }
  
  mapPlayersToDropdownFormat(players: Player[]): any[] {
    return players.map(player => ({
      id: player.id,
      name: `${player.firstname || ''} ${player.lastname || ''}`.trim(),
      imageUrl: player.imageUrl || player.playerImage,
      healthStatus: player.healthStatus,
      position: player.position,
      email: player.email
    }));
  }

  getMockTeam(): TeamDto {
    return {
      teamId: this.teamId,
      teamName: 'Team ' + this.teamId,
      categorie: CATEGORIE.Seniors,
      clubId: 1,
      clubName: 'FC Barcelona',
      coachId: 101,
      coachName: 'John Smith',
      playerCount: 3,
      players: [
        {
          id: 201, firstname: 'Player', lastname: '1', email: 'player1@example.com', role: 'PLAYER',
          dateOfBirth: '',
          enabled: false,
          accountLocked: false,
          position: '',
          jerseyNumber: 0,
          playerImage: undefined,
          healthStatus: null
        },
        {
          id: 202, firstname: 'Player', lastname: '2', email: 'player2@example.com', role: 'PLAYER',
          dateOfBirth: '',
          enabled: false,
          accountLocked: false,
          position: '',
          jerseyNumber: 0,
          playerImage: undefined,
          healthStatus: null
        },
        {
          id: 203, firstname: 'Player', lastname: '3', email: 'player3@example.com', role: 'PLAYER',
          dateOfBirth: '',
          enabled: false,
          accountLocked: false,
          position: '',
          jerseyNumber: 0,
          playerImage: undefined,
          healthStatus: null
        }
      ]
    };
  }
  
  updateAvailablePlayers(): void {
    if (this.team && this.team.players) {
      const playerIds = this.team.players.map(p => p.id);
      this.availablePlayers = this.availablePlayers.filter(p => !playerIds.includes(p.id));
    }
  }
  
  updateAvailableCoaches(): void {
    if (this.team && this.team.coachId) {
      this.availableCoaches = this.availableCoaches.filter(c => c.id !== this.team?.coachId);
    }
  }

  onAssignPlayer(): void {
    if (!this.selectedPlayerId || !this.team) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.successMessage = '';
    
    // Find the selected player from our available players list
    const selectedPlayer = this.availablePlayers.find(p => p.id === this.selectedPlayerId);
    if (!selectedPlayer) {
      this.error = 'Selected player not found';
      this.loading = false;
      return;
    }
    
    this.teamService.assignPlayerToTeam(this.selectedPlayerId, this.teamId).subscribe({
      next: (updatedTeam) => {
        this.team = updatedTeam;
        this.successMessage = 'Player successfully assigned to team!';
        
        // Update available players list by removing the assigned player
        this.availablePlayers = this.availablePlayers.filter(p => p.id !== this.selectedPlayerId);
        this.selectedPlayerId = 0; // Reset selection
        window.location.reload();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error assigning player:', err);
        this.error = `Failed to assign player: ${err.status === 0 
          ? 'Server connection error' 
          : err.error?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  onAssignCoach(): void {
    if (!this.newCoachId || !this.team) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.successMessage = '';
    
    if (!this.isBackendAvailable) {
      // Mock implementation for demonstration
      setTimeout(() => {
        const selectedCoach = this.availableCoaches.find(c => c.id === this.newCoachId);
        if (selectedCoach && this.team) {
          this.team.coachId = selectedCoach.id;
          this.team.coachName = `${selectedCoach.firstname} ${selectedCoach.lastname}`;
          
          // Remove from available coaches
          this.availableCoaches = this.availableCoaches.filter(c => c.id !== this.newCoachId);
          
          this.successMessage = 'Coach successfully assigned to team! (Mock implementation)';
          this.newCoachId = 0;

        }
        this.loading = false;
      }, 800);
      return;
    }
    
    this.teamService.assignCoachToTeam(this.newCoachId, this.teamId).subscribe({
      next: (updatedTeam) => {
        this.team = updatedTeam;
        this.successMessage = 'Coach successfully assigned to team!';
        this.newCoachId = 0; // Reset selection
        this.updateAvailableCoaches();
        this.loading = false;
        window.location.reload();

      },
      error: (err: HttpErrorResponse) => {
        console.error('Error assigning coach:', err);
        this.error = `Failed to assign coach: ${err.status === 0 
          ? 'Server connection error' 
          : err.error?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  removePlayer(playerId: number): void {
    if (!this.team || !this.team.players) {
      return;
    }
    
    if (confirm('Are you sure you want to remove this player from the team?')) {
      this.loading = true;
      this.error = '';
      this.successMessage = '';
      
      if (!this.isBackendAvailable) {
        // Mock implementation for demonstration
        setTimeout(() => {
          if (this.team && this.team.players) {
            const removedPlayer = this.team.players.find(p => p.id === playerId);
            if (removedPlayer) {
              // Add back to available players
              this.availablePlayers.push({ 
                id: removedPlayer.id, 
                name: `${removedPlayer.firstname} ${removedPlayer.lastname}` 
              });
              
              // Remove from team
              this.team.players = this.team.players.filter(p => p.id !== playerId);
              this.team.playerCount = this.team.players.length;
            }
          }
          
          this.successMessage = 'Player successfully removed from team! (Mock implementation)';
          this.loading = false;
        }, 800);
        return;
      }
      
      this.teamService.removePlayerFromTeam(playerId, this.teamId).subscribe({
        next: () => {
          if (this.team && this.team.players) {
            // Add the removed player back to available players
            const removedPlayer = this.team.players.find((p: any) => p.id === playerId);
            if (removedPlayer) {
              this.availablePlayers.push({ 
                id: removedPlayer.id, 
                name: `${removedPlayer.firstname} ${removedPlayer.lastname}` 
              });
            }
            
            // Update team data
            this.team.players = this.team.players.filter(p => p.id !== playerId);
            this.team.playerCount = this.team.players.length;
          }
          
          this.successMessage = 'Player successfully removed from team!';
          this.loading = false;
          window.location.reload();

        },
        error: (err: HttpErrorResponse) => {
          console.error('Error removing player:', err);
          this.error = `Failed to remove player: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  removeCoach(): void {
    if (!this.team || !this.team.coachId) {
      return;
    }
    
    if (confirm('Are you sure you want to remove the coach from this team?')) {
      this.loading = true;
      this.error = '';
      this.successMessage = '';
      
      if (!this.isBackendAvailable) {
        // Mock implementation for demonstration
        setTimeout(() => {
          if (this.team && this.team.coachId) {
            // Add back to available coaches - find the coach if available
            const removedCoach = this.availableCoaches.find(c => c.id === this.team!.coachId);
            if (removedCoach) {
              // The coach is already in the availableCoaches list
              console.log('Coach already in available list, no need to add');
            } else {
              // Create a new coach object with the available information
              this.coachService.getCoachById(this.team.coachId).subscribe({
                next: (coach) => {
                  this.availableCoaches.push(coach);
                },
                error: () => {
                  console.warn('Could not fetch coach details, using partial information');
                  // Use partial information to create a coach object
                  const coachName = this.team?.coachName || 'Unknown Coach';
                  const nameParts = coachName.split(' ');
                  this.availableCoaches.push({
                    id: this.team!.coachId!,
                    firstname: nameParts[0] || 'Unknown',
                    lastname: nameParts.slice(1).join(' ') || '',
                    email: '',
                    specializationCoach: '',
                    diplome: '',
                    password: ''
                  } as Coach);
                }
              });
            }
            
            // Remove from team
            this.team.coachId = undefined;
            this.team.coachName = undefined;
          }
          
          this.successMessage = 'Coach successfully removed from team! (Mock implementation)';
          this.loading = false;
        }, 800);
        return;
      }
      
      this.teamService.removeCoachFromTeam(this.team.coachId, this.teamId).subscribe({
        next: () => {
          if (this.team && this.team.coachId) {
            // Add the removed coach back to available coaches
            const coach = this.availableCoaches.find(c => c.id === this.team!.coachId);
            if (!coach) {
              // Create a new coach object with the available information
              const coachName = this.team.coachName || 'Unknown Coach';
              const nameParts = coachName.split(' ');
              this.availableCoaches.push({
                id: this.team.coachId,
                firstname: nameParts[0] || 'Unknown',
                lastname: nameParts.slice(1).join(' ') || '',
                email: '',
                specializationCoach: '',
                diplome: '',
                password: ''
              } as Coach);
            }
            
            // Update team data
            this.team.coachId = undefined;
            this.team.coachName = undefined;
          }
          
          this.successMessage = 'Coach successfully removed from team!';
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error removing coach:', err);
          this.error = `Failed to remove coach: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  editTeam(): void {
    // Navigate to team-form with the team ID and club ID as state
    this.router.navigate(['/team-form', this.teamId], {
      state: { clubId: this.team?.clubId || this.clubid }
    });
  }

  goBack(): void {
    this.router.navigate(['/team']);
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

  // Check if team data is incomplete and use mock data if needed
  checkAndFixIncompleteTeamData(teamData: TeamDto | null): TeamDto {
    // Check if team data is incomplete or missing essential fields
    if (!teamData || !teamData.teamName || !teamData.categorie) {
      console.warn('Received incomplete team data:', teamData);
      
      // Create a merged object using mock data for missing fields
      const mockTeam = this.getMockTeam();
      const mergedTeam: TeamDto = {
        teamId: teamData?.teamId || mockTeam.teamId,
        teamName: teamData?.teamName || mockTeam.teamName,
        categorie: teamData?.categorie || mockTeam.categorie,
        clubId: teamData?.clubId || mockTeam.clubId,
        clubName: teamData?.clubName || mockTeam.clubName,
        coachId: teamData?.coachId || mockTeam.coachId,
        coachName: teamData?.coachName || mockTeam.coachName,
        playerCount: teamData?.playerCount || mockTeam.playerCount,
        players: teamData?.players || mockTeam.players
      };
      
      console.log('Using merged data to fix incomplete response:', mergedTeam);
      return mergedTeam;
    }
    
    return teamData;
  }

  // Load the team's players directly from the team players endpoint
  loadTeamPlayersDirectly(): void {
    this.loadingPlayers = true;
    this.teamService.getTeamPlayers(this.teamId).subscribe({
      next: (players) => {
        console.log('Team players loaded directly from API:', players);
        // Update the team's players array with the directly fetched players
        if (this.team) {
          this.team.players = players;
          this.team.playerCount = players.length;
        }
        this.teamPlayers = players;
        this.loadingPlayers = false;
      },
      error: (err) => {
        console.error(`Error loading players directly for team ${this.teamId}:`, err);
        this.error = `Failed to load team players: ${err.message || 'Unknown error'}`;
        this.loadingPlayers = false;
      }
    });
  }

  // Load coaches from the same club
  loadCoachesForClub(clubId: number): void {
    console.log('Loading coaches for club ID:', clubId);
    
    this.coachService.getCoachesByClubId(clubId).subscribe({
      next: (coaches) => {
        console.log(`Loaded ${coaches.length} coaches from club ID ${clubId}:`, coaches);
        this.availableCoaches = coaches;
        
        // Filter out the coach that's already assigned to the team
        this.updateAvailableCoaches();
      },
      error: (err) => {
        console.error(`Error loading coaches for club ${clubId}:`, err);
        this.error = `Failed to load coaches from club: ${err.message || 'Unknown error'}`;
      }
    });
  }

  // Update coach information with data from the database
  updateCoachInfo(coachId: number): void {
    console.log('Updating coach information for coach ID:', coachId);
    
    this.coachService.getCoachById(coachId).subscribe({
      next: (coach) => {
        console.log('Coach data loaded:', coach);
        if (this.team && coach) {
          // Update the team's coach information with accurate data from the database
          this.team.coachName = `${coach.firstname} ${coach.lastname}`;
          console.log('Updated team coach name to:', this.team.coachName);
        }
      },
      error: (err) => {
        console.error(`Error loading coach details for ID ${coachId}:`, err);
      }
    });
  }

  // TEAM STATISTICS METHODS

  // Load statistics for the team
  loadTeamStatistics(): void {
    this.statsLoading = true;
    
    this.teamStatsService.getTeamStatistics(this.teamId).subscribe({
      next: (data) => {
        this.teamStatistics = data;
        this.prepareChartData(data);
        this.statsLoading = false;
      },
      error: (error) => {
        console.error('Error loading team statistics:', error);
        this.statsLoading = false;
        // We don't want to show an error message for this, as it's not critical
      }
    });
  }

  // Prepare chart data for visualization
  prepareChartData(statistics: TeamStatistics[]): void {
    // Sort statistics by date (oldest to newest)
    const sortedStats = [...statistics].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract dates for labels and metrics for datasets
    const labels = sortedStats.map(stat => new Date(stat.date).toLocaleDateString());
    const performanceData = sortedStats.map(stat => stat.performanceRate);
    const winsData = sortedStats.map(stat => stat.totalWins);
    const lossesData = sortedStats.map(stat => stat.totalLosses);
    const rankingData = sortedStats.map(stat => stat.rankingPoints);

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
          label: 'Wins',
          data: winsData,
          borderColor: '#2a9d8f',
          backgroundColor: 'rgba(42, 157, 143, 0.2)',
          fill: true,
          tension: 0.4
        },
        { 
          label: 'Losses',
          data: lossesData,
          borderColor: '#e63946',
          backgroundColor: 'rgba(230, 57, 70, 0.2)',
          fill: true,
          tension: 0.4
        },
        { 
          label: 'Ranking Points',
          data: rankingData,
          borderColor: '#f4a261',
          backgroundColor: 'rgba(244, 162, 97, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  // Start adding statistics for a team
  addStatistics(): void {
    if (!this.team || !this.teamId) {
      this.error = 'Cannot add statistics: Team information not available';
      setTimeout(() => this.error = '', 3000);
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
      totalWins: 0,
      totalLosses: 0,
      rankingPoints: 0
    });
  }

  // Edit existing statistics
  editStatistics(stat: TeamStatistics): void {
    this.isAddingStats = false;
    this.isEditingStats = true;
    this.selectedStatistic = stat;
    
    this.statsForm.patchValue({
      teamstaId: stat.teamstaId,
      date: new Date(stat.date).toISOString().split('T')[0],
      performanceRate: stat.performanceRate,
      totalWins: stat.totalWins,
      totalLosses: stat.totalLosses,
      rankingPoints: stat.rankingPoints
    });
  }

  // Delete statistics
  deleteStatistics(statId: number): void {
    if (confirm('Are you sure you want to delete this statistic record?')) {
      this.statsLoading = true;
      
      this.teamStatsService.deleteTeamStatistics(statId).subscribe({
        next: () => {
          this.successMessage = 'Statistics deleted successfully!';
          this.loadTeamStatistics();
          this.statsLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.error = 'Failed to delete statistics. Please try again.';
          this.statsLoading = false;
          console.error('Error deleting statistics:', error);
          setTimeout(() => this.error = '', 3000);
        }
      });
    }
  }

  // Submit statistics form
  onStatisticsSubmit(): void {
    if (this.statsForm.invalid || !this.teamId) {
      return;
    }

    const statsData: TeamStatistics = this.statsForm.value;
    this.statsLoading = true;

    if (this.isEditingStats && this.selectedStatistic && this.selectedStatistic.teamstaId) {
      // Update existing statistics
      this.teamStatsService.updateTeamStatistics(this.selectedStatistic.teamstaId, statsData).subscribe({
        next: () => {
          this.successMessage = 'Statistics updated successfully!';
          this.loadTeamStatistics();
          this.isEditingStats = false;
          this.isAddingStats = false;
          this.statsLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.error = 'Failed to update statistics. Please try again.';
          this.statsLoading = false;
          console.error('Error updating statistics:', error);
          setTimeout(() => this.error = '', 3000);
        }
      });
    } else {
      // Add new statistics
      this.teamStatsService.addTeamStatistics(this.teamId, statsData).subscribe({
        next: () => {
          this.successMessage = 'Statistics added successfully!';
          this.loadTeamStatistics();
          this.isAddingStats = false;
          this.statsLoading = false;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.error = 'Failed to add statistics. Please try again.';
          this.statsLoading = false;
          console.error('Error adding statistics:', error);
          setTimeout(() => this.error = '', 3000);
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
    if (!this.teamStatistics || this.teamStatistics.length === 0) {
      return 0;
    }
    const total = this.teamStatistics.reduce((sum, stat) => sum + stat.performanceRate, 0);
    return parseFloat((total / this.teamStatistics.length).toFixed(1));
  }

  // Get total wins
  getTotalWins(): number {
    if (!this.teamStatistics || this.teamStatistics.length === 0) {
      return 0;
    }
    return this.teamStatistics.reduce((sum, stat) => sum + stat.totalWins, 0);
  }

  // Get total losses
  getTotalLosses(): number {
    if (!this.teamStatistics || this.teamStatistics.length === 0) {
      return 0;
    }
    return this.teamStatistics.reduce((sum, stat) => sum + stat.totalLosses, 0);
  }

  // Get win ratio
  getWinRatio(): string {
    const wins = this.getTotalWins();
    const losses = this.getTotalLosses();
    const total = wins + losses;
    
    if (total === 0) {
      return '0%';
    }
    
    return ((wins / total) * 100).toFixed(1) + '%';
  }

  // Get latest ranking points
  getLatestRankingPoints(): number {
    if (!this.teamStatistics || this.teamStatistics.length === 0) {
      return 0;
    }
    
    // Sort by date (newest first) and get the latest ranking
    const sortedStats = [...this.teamStatistics].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedStats[0].rankingPoints;
  }

  // Download team report
  downloadTeamReport(teamId: number | undefined): void {
    if (!teamId) {
      this.error = 'Cannot download report: Invalid team ID';
      return;
    }
    
    // Show loading or feedback
    this.loading = true;
    
    // Create a function to create and trigger download
    const downloadPdf = () => {
      // Create a link element
      const link = document.createElement('a');
      link.href = `http://localhost:8088/spr01/api/reports/team/${teamId}`;
      link.setAttribute('download', `team_stats_${teamId}.pdf`);
      link.setAttribute('target', '_blank');
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Hide loading
      this.loading = false;
      this.successMessage = 'Team report download initiated!';
      setTimeout(() => this.successMessage = '', 3000);
    };
    
    // Call the download function
    downloadPdf();
  }
}