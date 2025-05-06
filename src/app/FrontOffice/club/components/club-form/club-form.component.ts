import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClubService } from '../../services/club.service';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-club-form',
  templateUrl: './club-form.component.html',
})
export class ClubFormComponent implements OnInit {
  clubForm!: FormGroup;
  clubId: number | null = null;
  isEditMode = false;
  submitted = false;
  loading = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private clubService: ClubService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.clubId = +params['id'];
        this.isEditMode = true;
        
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams['useStoredData']) {
            const storedClub = this.clubService.getCurrentClub();
            
            if (storedClub && storedClub.clubId === this.clubId) {
              this.patchFormWithClubData(storedClub);
              return;
            }
          }
          
          if (this.clubId !== null) {
            this.loadClubData(this.clubId);
          }
        });
      }
    });
  }

  initForm(): void {
    this.clubForm = this.fb.group({
      clubName: ['', [Validators.required, Validators.minLength(3)]],
      clubDescription: ['', Validators.required],
      clubAddress: ['', Validators.required],
      clubCity: ['', Validators.required]
    });
  }

  private patchFormWithClubData(club: Club): void {
    this.clubForm.patchValue({
      clubName: club.clubName,
      clubDescription: club.clubDescription,
      clubAddress: club.clubAddress,
      clubCity: club.clubCity
    });
    
    if (club.clubImage) {
      this.imagePreview = `http://localhost:8088/spr01/uploads/${club.clubImage}`;
    }
  }

  loadClubData(clubId: number): void {
    this.loading = true;
    this.clubService.getClubById(clubId).subscribe({
      next: (club) => {
        this.patchFormWithClubData(club);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading club data:', error);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/image-placeholder.png';
    console.error('Error loading the image');
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.clubForm.invalid) {
      return;
    }
    
    if (!this.selectedFile && !this.isEditMode) {
      console.error('No file selected');
      return;
    }
    
    this.loading = true;
    
    const formData = new FormData();
    formData.append('clubName', this.clubForm.value.clubName);
    formData.append('clubDescription', this.clubForm.value.clubDescription);
    formData.append('clubAddress', this.clubForm.value.clubAddress);
    formData.append('clubCity', this.clubForm.value.clubCity);
    
    if (this.selectedFile) {
      formData.append('clubImage', this.selectedFile);
    }
    
    if (this.isEditMode && this.clubId) {
      formData.append('clubId', this.clubId.toString());
      this.clubService.updateClub(this.clubId, formData).subscribe({
        next: (response) => {
          console.log('Club updated successfully', response);
          this.loading = false;
          this.router.navigate(['/club/clubs']);
        },
        error: (error) => {
          console.error('Error updating club:', error);
          this.loading = false;
        }
      });
    } else {
      this.clubService.addClub(formData).subscribe({
        next: (response) => {
          console.log('Club added successfully', response);
          this.loading = false;
          this.router.navigate(['/club/clubs']);
        },
        error: (error) => {
          console.error('Error adding club:', error);
          this.loading = false;
        }
      });
    }
  }
}
