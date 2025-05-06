import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { Team, TeamDto } from '../../Models/Team';
import { CATEGORIE } from '../../Models/categorie.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { ClubService } from '../club/services/club.service';

@Component({
  selector: 'app-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.css']
})
export class TeamFormComponent implements OnInit {
  teamForm: FormGroup;
  teamId: number = 0;
  isEditMode: boolean = false;
  loading: boolean = false;
  submitted: boolean = false;
  error: string = '';
  successMessage: string = '';
  categories = Object.values(CATEGORIE);
  
  // Club options - will be loaded from the backend
  clubOptions: any[] = [];
  
  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService
  ) {
    this.teamForm = this.createForm();
  }

  ngOnInit(): void {
    // Load clubs first, then handle route params
    this.loadClubs();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.teamId = +params['id'];
        this.isEditMode = true;
        this.loadTeam();
      } else {
        // Pre-populate club ID if coming from the team list or management
        const savedClubId = localStorage.getItem('selectedClubId');
        if (savedClubId) {
          this.teamForm.patchValue({
            clubId: parseInt(savedClubId)
          });
        }
      }
    });
    
    // Check for state params from router navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      const state = navigation.extras.state as any;
      if (state && state.clubId) {
        this.teamForm.patchValue({
          clubId: state.clubId
        });
      }
    }
  }
  
  // Load clubs from the backend
  loadClubs(): void {
    this.clubService.getAllClubs().subscribe({
      next: (clubs) => {
        console.log('Loaded clubs:', clubs);
        // Transform clubs data to the format needed for the dropdown
        this.clubOptions = clubs.map(club => ({
          id: club.clubId,
          name: club.clubName || club.clubName || 'Unknown Club'
        }));
      },
      error: (err) => {
        console.error('Error loading clubs:', err);
        this.error = 'Failed to load clubs. Please refresh the page.';
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      teamName: ['', [Validators.required, Validators.minLength(3)]],
      categorie: [CATEGORIE.Seniors, Validators.required],
      clubId: [0, Validators.required]
    });
  }

  loadTeam(): void {
    this.loading = true;
    
    this.teamService.getTeamById(this.teamId).subscribe({
      next: (team) => {
        console.log('Loaded team data:', team);
        
        // Patch the form with the team data from the backend
        this.teamForm.patchValue({
          teamName: team.teamName,
          categorie: team.categorie,
          clubId: team.clubId
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading team:', err);
        this.error = `Failed to load team: ${err.status === 0 
          ? 'Server connection error' 
          : err.error?.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.successMessage = '';
    
    if (this.teamForm.invalid) {
      return;
    }
    
    this.loading = true;
    const formValue = this.teamForm.value;
    const clubId = formValue.clubId;
    
    // Remove clubId from the form data as it's passed separately in addTeam
    const teamData: Team = {
      teamName: formValue.teamName,
      categorie: formValue.categorie
    };
    
    if (this.isEditMode) {
      // Add the teamId for update operation
      teamData.teamId = this.teamId;
      
      // Update existing team
      this.teamService.updateTeam(this.teamId, teamData as TeamDto).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Team successfully updated!';
          setTimeout(() => {
            this.router.navigate(['/team']);
          }, 1500);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error updating team:', err);
          this.error = `Failed to update team: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    } else {
      // Create new team
      this.teamService.addTeam(teamData, clubId).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Team successfully created!';
          setTimeout(() => {
            this.router.navigate(['/team']);
          }, 1500);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error creating team:', err);
          this.error = `Failed to create team: ${err.status === 0 
            ? 'Server connection error' 
            : err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      });
    }
  }

  get f() { return this.teamForm.controls; }
  
  resetForm(): void {
    this.submitted = false;
    if (this.isEditMode) {
      this.loadTeam();
    } else {
      this.teamForm.reset({
        categorie: CATEGORIE.Seniors,
        clubId: this.teamForm.value.clubId || 0
      });
    }
  }
}