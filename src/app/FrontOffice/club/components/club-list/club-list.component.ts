import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClubService } from '../../services/club.service';
import { Club } from '../../models/club.model';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-club-list',
  templateUrl: './club-list.component.html',
  styleUrls: ['./club-list.component.scss']
})
export class ClubListComponent implements OnInit {
  clubs: Club[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  clubForm!: FormGroup;
  submitted = false;
  clubImagePreview: string | null = null;
  clubModal: Modal | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  private previousActiveElement: HTMLElement | null = null;

  constructor(
    private clubService: ClubService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadAllClubs();
    this.initForm();
  }

  initForm(): void {
    this.clubForm = this.fb.group({
      clubName: ['', [Validators.required]],
      clubDescription: ['', [Validators.required]],
      clubAddress: ['', [Validators.required]],
      clubCity: ['', [Validators.required]]
    });
  }

  get f() { 
    return this.clubForm.controls; 
  }

  goToAddClubForm(): void {
    this.router.navigate(['/club/create']);
  }

  loadAllClubs(): void {
    this.loading = true;
    this.clubService.getAllClubs().subscribe({
      next: (data) => {
        this.clubs = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching clubs:', error);
        this.loading = false;
        this.showError('Failed to load clubs. Please try again later.');
      }
    });
  }

  searchClubs(): void {
    if (this.searchTerm.trim() !== '') {
      this.loading = true;
      this.clubService.getClubsByName(this.searchTerm).subscribe({
        next: (data) => {
          this.clubs = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching clubs:', error);
          this.loading = false;
          this.showError('Error searching clubs. Please try again.');
        }
      });
    } else {
      this.loadAllClubs();
    }
  }

  viewClubDetails(clubId: number): void {
    const club = this.clubs.find(c => c.clubId === clubId);
    
    if (club) {
      this.clubService.setCurrentClub(club);
    }
    
    this.router.navigate(['/club/clubs', clubId]);
  }

  editClub(clubId: number): void { 
    const club = this.clubs.find(c => c.clubId === clubId);
    
    if (club) {
      this.clubService.setCurrentClub(club);
      this.router.navigate(['/club/edit-club', clubId], { 
        queryParams: { useStoredData: true }
      });
    } else {
      this.router.navigate(['/club/edit-club', clubId]);
    }
  }

  deleteClub(clubId: number): void {
    if (confirm('Are you sure you want to delete this club?')) {
      this.clubService.deleteClub(clubId).subscribe({
        next: () => {
          this.clubs = this.clubs.filter(club => club.clubId !== clubId);
          this.showSuccess('Club deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting club:', error);
          this.showError('Failed to delete club. Please try again.');
        }
      });
    }
  }

  showError(message: string): void {
    this.errorMessage = message;
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }
  
  showSuccess(message: string): void {
    this.successMessage = message;
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.successMessage = null;
    }, 5000);
  }
  
  onFileChange(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.clubImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
