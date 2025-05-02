import { Component } from '@angular/core';
import { PerformanceService } from '../../services/performance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { PerformanceTracking } from '../../Models/PerformanceTracking';

@Component({
  selector: 'app-performance-form',
  templateUrl: './performance-form.component.html',
  styleUrl: './performance-form.component.css'
})
export class PerformanceFormComponent {

 // performanceForm: FormGroup | undefined;
  playerId: number | null = null;
  isSubmitting = false;
  performance : PerformanceTracking | undefined;
  performanceForm: FormGroup = new FormGroup({});
  constructor(
    private fb: FormBuilder,
    private performanceService: PerformanceService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.playerId = parseInt(this.route.snapshot.paramMap.get('playerId')!, 10);
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.loadPerformanceData(params['id']);}
});
      
    this.performanceForm = new FormGroup({
      dateSuivi: new FormControl(new Date().toISOString().split('T')[0], Validators.required),
      douleur: new FormControl("", [Validators.required, Validators.min(0), Validators.max(10)]),
      endurance: new FormControl("", [Validators.required, Validators.min(0), Validators.max(100)]),
      frequenceCardiaque: new FormControl("", [Validators.required, Validators.min(40), Validators.max(220)]),
      poids: new FormControl("", [Validators.required, Validators.min(30), Validators.max(200)]),
      indiceFatigue: new FormControl("", [Validators.required, Validators.min(0), Validators.max(10)]),
      apteAReprendre: new FormControl(false)
    });
  }
  loadPerformanceData(id: number) {
    this.performanceService.getPerformance(id).subscribe(data => {
      this.performance = data;
      this.performanceForm!.patchValue(data);
    });
}

  onSubmit(): void {
    if (this.performanceForm!.valid) {
      const formValues = this.performanceForm!.value;
      const performanceData = {
        ...formValues,
        playerId: this.playerId
      };
  
      // Si l'objet de performance contient déjà un ID => mise à jour
      if (this.performance?.id) {
        this.performanceService.updatePerformance(this.performance.id, performanceData).subscribe({
          next: () => {
            Swal.fire(
              'Performance updated!',
              'The performance data was successfully updated.',
              'success'
            );
            this.router.navigate(['/DashboardPerformance/', this.performance?.playerId]);
          },
          error: (error) => {
            console.error('Error updating performance:', error);
            Swal.fire(
              'Error!',
              'An error occurred while updating performance.',
              'error'
            );
          }
        });
      } else {
        // Sinon, on ajoute une nouvelle performance
        this.performanceService.addPerformance(performanceData).subscribe({
          next: () => {
            Swal.fire(
              'Performance added!',
              'Performance data was saved successfully.',
              'success'
            );
            this.router.navigate(['/DashboardPerformance/', this.playerId]);
          },
          error: (error) => {
            console.error('Error creating performance:', error);
            Swal.fire(
              'Error!',
              'An error occurred while saving the performance.',
              'error'
            );
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
