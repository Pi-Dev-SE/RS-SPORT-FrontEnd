import { Component } from '@angular/core';
import { RecoveryRegimeService } from '../../services/recovery-regime.service';
import { Router } from '@angular/router';
import { RecoveryRegime } from '../../Models/RecoveryRegime';
import { TypeStatusRegime } from '../../Models/type-status-regime';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recovery-regime',
  templateUrl: './recovery-regime.component.html',
  styleUrl: './recovery-regime.component.css'
})
export class RecoveryRegimeComponent {

  constructor (private regimeService: RecoveryRegimeService,private router: Router,
    
  ){}

regimes: RecoveryRegime []=[];
TypeStatusRegime = TypeStatusRegime ;
searchTerm: string = '';
isLoading: boolean = false;
page: number = 1; 
totalPages: number = 0;
itemsPerPage: number = 3;
remainingDay: number = 0;

currentPage: number = 0;



filteredRegimes(): RecoveryRegime[] {
  if (!this.searchTerm) {
    return this.regimes;
  }

  return this.regimes.filter(regime =>
    regime.firstname?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    regime.recommendedExercise?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    regime.dietRecommendation?.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}



  ngOnInit() {
    this.currentPage = 0;
  this.loadRegimes();
  }
  
  loadRegimes() {
    this.isLoading = true;
    this.regimeService.getRegimes(this.currentPage, this.itemsPerPage).subscribe({
      next: (data) => {
        console.log("Loaded regimes:", data);  // Vérifier les données ici
        this.regimes = data.content;
        this.totalPages = data.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire("Error", "Failed to load regimes", "error");
      }
    });
  }
  
    

  changePage(newPage: number) {
    this.currentPage = newPage;
    this.loadRegimes();
  }
  
  
  editRegime(regimeId: number) {
    this.router.navigate(['/Addregime'], { queryParams: { id: regimeId } });
  }

  dayRemaining(regimeId: number) {
    this.regimeService.getRemainingDay(regimeId).subscribe(data => {
      this.remainingDay = data;
      if (this.remainingDay <= 0){
        Swal.fire({
          title: "Remaining Days",
          text: " recovery regime completed " ,
          icon: "success"
        });

      }else
      Swal.fire({
        title: "Remaining Days",
        text: "Time remaining in recovery regime : " + this.remainingDay + " " +  "Days",
        icon: "success"
      });
    });
  }
  
  deleteRegime(id: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.regimeService.deleteRegime(id).subscribe({
          next: () => {
            this.loadRegimes();
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success"
            });
          },
          error: (err) => {
            console.error('Error deleting regime:', err);
            Swal.fire({
              title: "Error!",
              text: "Failed to delete the regime.",
              icon: "error"
            });
          }
        });
      }
    });
  }

}


