import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Coach } from '../../models/coach.model';
import { CoachService } from '../../services/coach.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-coach-detail',
  templateUrl: './coach-detail.component.html',
  styleUrls: ['./coach-detail.component.scss']
})
export class CoachDetailComponent implements OnInit {
  coach: Coach | undefined;
  coachId: number | undefined;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coachService: CoachService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.coachId = +params['id'];
        console.log('Coach ID from route:', this.coachId);
        this.loadCoachData();
      } else {
        console.log('No ID provided in route');
        this.router.navigate(['/coaches']);
      }
    });
  }

  loadCoachData(): void {
    if (!this.coachId) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    console.log('Fetching coach data for ID:', this.coachId);
    
    this.coachService.getCoachById(this.coachId).subscribe({
      next: (coachData) => {
        console.log('Coach data received:', coachData);
        
        if (Array.isArray(coachData)) {
          // Find the coach with the matching ID in the array
          const matchingCoach = coachData.find(coach => coach.id === this.coachId);
          
          if (matchingCoach) {
            this.coach = matchingCoach;
            console.log('Found matching coach:', this.coach);
          } else {
            // If no matching coach is found, take the first one if available
            this.coach = coachData.length > 0 ? coachData[0] : undefined;
            console.log('No exact match found, using first coach:', this.coach);
          }
        } else {
          // If it's not an array, use it directly
          this.coach = coachData;
        }
        
        this.isLoading = false;
        
        // Check if coach data is empty or malformed
        if (!this.coach || Object.keys(this.coach).length === 0) {
          console.warn('Coach data is empty or invalid');
          this.errorMessage = 'Coach data is empty or invalid';
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching coach:', error);
        this.isLoading = false;
        
        // Check if this is the specific "No coaches" text response error
        if (error.status === 200 && error.error?.text?.includes('No coaches')) {
          this.errorMessage = error.error.text || 'No coaches found';
        } else if (error.error?.text) {
          this.errorMessage = error.error.text;
        } else {
          this.errorMessage = 'Failed to load coach details. Please try again later.';
        }
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/coaches/edit', this.coachId]);
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this coach?')) {
      if (!this.coachId) {
        return;
      }
      this.coachService.deleteCoach(this.coachId).subscribe({
        next: () => {
          this.router.navigate(['/coaches']);
        },
        error: (error) => {
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/coaches']);
  }
}