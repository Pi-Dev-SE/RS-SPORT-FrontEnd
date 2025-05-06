
import { Component } from '@angular/core';
import { HealthReport } from '../../Models/HealthReport';
import { MedicalReportService } from '../../services/medical-report.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medical-report-form',
  templateUrl: './medical-report-form.component.html',
  styleUrl: './medical-report-form.component.css'
})
export class MedicalReportFormComponent {

  aForm: FormGroup | undefined;
  injuryTypes = ['LOW', 'MODERATE', 'HIGH']; // Liste des types de blessure
  statusList = ['ACTIVE', 'INJURED', 'RECOVERING']; // Liste des statuts de santé

  staffList: any[] = [];
  playerList: any[] = [];
  report: HealthReport | null = null;

  constructor(private reportService: MedicalReportService, private route: ActivatedRoute,
    private router: Router ) {}


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.loadReportData(params['id']);
      }
    });

    this.aForm = new FormGroup({
      injuryType: new FormControl('', Validators.required),
      injurySeverity: new FormControl('', Validators.required),
      diagnosisDate: new FormControl('', Validators.required),
      expectedRecoveryDate: new FormControl(''),
      recoveryPlan: new FormControl(''),
      fitnessLevel: new FormControl('', [Validators.required, Validators.pattern(/^(Low|Medium|High)$/)]),
      medicalNotes: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      staffId: new FormControl('', Validators.required),
      playerId: new FormControl('', Validators.required),
    },
    { validators: [this.dateValidator] }
  );

    this.reportService.getMedicalStaff().subscribe({
      next: (data) => this.staffList = data,
      error: (err) => console.error('Failed to fetch staff:', err)
    });

    this.reportService.getPlayers().subscribe({
      next: (data) => this.playerList = data,
      error: (err) => console.error('Failed to fetch players:', err)
    });
  }

  loadReportData(id: number) {
    this.reportService.getReportById(id).subscribe(data => {
      this.report = data;
      this.aForm!.patchValue(data);
      this.playerList = [{ id: data.playerId, firstname: data.firstNamePlay }];
      this.staffList = [{id: data.staffId, firstname: data.firstNameMed}]
      console.log(this.aForm!.value);
      console.log(this.aForm!.valid);

    });
  }
  dateValidator(control: AbstractControl) {
    const group = control as FormGroup;
    const diagnosisDate = new Date(group.controls['diagnosisDate'].value);
    const expectedRecoveryDate = new Date(group.controls['expectedRecoveryDate'].value);

    return diagnosisDate && expectedRecoveryDate && diagnosisDate > expectedRecoveryDate
      ? { invalidDateRange: true }
      : null;
  }
  onSubmit() {
    if (this.aForm!.valid) {
      const reportData = this.aForm!.value;

      if (this.report?.healthId) {
        this.reportService.updateReport(this.report.healthId, reportData).subscribe({
          next: () => {
            Swal.fire(
              'Your informations!',
              'updated with success',
              'success'
            )

            this.router.navigate(['/report']);
          },
          error: (err) => {
            console.error("Erreur lors de la mise à jour :", err);
            Swal.fire(
              'Error!',
              'An error occurred while updating report.',
              'error'
            );
           // alert(err.error.message || "Une erreur est survenue lors de la mise à jour !");
          }
        });

      } else {
        this.reportService.addReport(reportData).subscribe({
          next: () => {
            Swal.fire(
              'Your informations!',
              'add with success',
              'success'
            )

            this.router.navigate(['/report']);
          },
          error: (err) => {
            console.error("Erreur lors de l'ajout :", err);
            Swal.fire(
              'Error!',
              'An error occurred while add report.',
              'error'
            );

            //alert(err.error.message || "rapport n'est pas ajouté !");
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
