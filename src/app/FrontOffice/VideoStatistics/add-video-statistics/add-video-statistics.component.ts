import { VideoStatisticsService } from './../../../service/VideoStatistics/video-statistics.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-video-statistics',
  templateUrl: './add-video-statistics.component.html',
  styleUrl: './add-video-statistics.component.css'
})
export class AddVideoStatisticsComponent {
          videoSForm!: FormGroup;
          videoAnalysisId!: number;

    constructor(private router:Router,
                private route : ActivatedRoute,
                 private videoservice:VideoStatisticsService,
                 private fb: FormBuilder,){}



    ngOnInit(): void {
      this.videoSForm = this.fb.group({
        totalDistanceCovered: [null, Validators.required],
        sprintDistance: [null, Validators.required],
        topSpeed: [null, Validators.required],
        passAccuracy:[null, Validators.required],
        passNbr: [null, Validators.required],
        minSpeed : [null, Validators.required],
      });

    }

    SavevideoS(){


      this.videoservice.addVideoStatistics(this.videoSForm.value).subscribe((data:any)=>{
        console.log("cc",data)
        this.router.navigateByUrl('getAllVideoStatistics')
        Swal.fire(
                'You informations!',
                'saved with success',
                'success'
              )

      })
     }






    /*SavevideoS() {
      if (!this.videoAnalysisId) {
        console.error("Video Analysis ID is undefined!");
        return;
      }

      this.videoservice.addVideoStatistics(this.videoSForm.value, this.videoAnalysisId).subscribe(
        (data: any) => {
          console.log('Video Statistics added successfully:', data);
          Swal.fire('Success!', 'Video Statistics saved successfully!', 'success');
          this.router.navigateByUrl('getAllVideoAnalysis');
        },
        (error) => {
          console.error('Error adding video statistics:', error);
          Swal.fire('Error!', 'Failed to save video statistics.', 'error');
        }
      );
    }*/


}
