import { Component } from '@angular/core';
import { RecoveryRegimeService } from '../../services/recovery-regime.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TypeStatusRegime } from '../../Models/type-status-regime';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recovery-regime-form',
  templateUrl: './recovery-regime-form.component.html',
  styleUrl: './recovery-regime-form.component.css'
})
export class RecoveryRegimeFormComponent {

  constructor(private regimeService: RecoveryRegimeService, private route: ActivatedRoute,
    private router: Router
  ){}
  rForm: FormGroup | undefined;
  regimeId: number | null = null;
  statusList = Object.values(TypeStatusRegime);
  healthID:number | null = null;
  progressList = ['Not Started', 'In Progress', 'Completed','Needs Improvement'];
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.regimeId = params['id'];
        this.loadRegimetData(this.regimeId!);
      }
  });
     
    this.healthID = parseInt(this.route.snapshot.paramMap.get('healthId')!, 10);


    this.rForm = new FormGroup({
      regimeId: new FormControl(''),
      healthId: new FormControl(this.healthID),
      generatedAt: new FormControl('', Validators.required),
      dailyDuration: new FormControl('', [Validators.required, Validators.min(1)]),
      recommendedExercise: new FormControl('', Validators.required),
      exerciseIntensity: new FormControl('', Validators.required),
      dietRecommendation: new FormControl('', Validators.required),
      physiotherapyRequired: new FormControl('', Validators.required),
      progressTracking: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      
    });
  }

  loadRegimetData(id: number) {
    this.regimeService.getRegimeById(id).subscribe(data => {
      this.rForm!.patchValue(data);
    });
  }

  onSubmit() {
    if (this.rForm!.valid) {
      const regimeData = this.rForm!.value;
  
      if (this.regimeId) {
        
        this.regimeService.updateRegime(this.regimeId, regimeData).subscribe({
          next: () => {
            Swal.fire(
              'Your informations!',
              'updated with success',
              'success'
            )
            
            this.router.navigate(['/regime']);
          },
          error: (err) => {
            console.error("Erreur lors de la mise à jour :", err);
            Swal.fire(
              'Error!',
              'An error occurred while updating regime.',
              'error'
            );
            //alert(err.error.message || "Une erreur est survenue lors de la mise à jour !");
          }
        });
      } else {
        
        this.regimeService.addRegime(regimeData).subscribe({
          next: () => {
            Swal.fire(
              'Your informations!',
              'add with success',
              'success'
            )
            
            this.router.navigate(['/regime']);
          },
          error: (err) => {
            console.error("Erreur lors de l'ajout :", err);
            Swal.fire(
              'Error!',
              'An error occurred while add regime.',
              'error'
            );
            //alert(err.error.message || "This HealthReport already has an assigned RecoveryRegime !");
          }
        });
      }
    } else {
      Swal.fire(
        'Invalid form',
        'Please complete all required fields correctly.',
        'warning'
      );
    }
  }

}
