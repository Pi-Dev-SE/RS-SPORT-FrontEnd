// add-video-analysis.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VideoAnalysisService } from '../../../service/VideoAnalysis/video-analysis.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-video-analysis',
  templateUrl: './add-video-analysis.component.html',
  styleUrls: ['./add-video-analysis.component.css']
})
export class AddVideoAnalysisComponent implements OnInit {

  videoForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private videoservice: VideoAnalysisService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.videoForm = this.fb.group({
      title: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      videoUrl: [null, Validators.required],
      description: [null, Validators.required],
      status: [null, Validators.required],
      analysisType: [null, Validators.required],
      recaptcha: [null, Validators.required]
    });
  }

  onFileSelected(video: any): void {
    this.selectedFile = video.target.files[0];
  }

  Savevideo(): void {
    if (this.videoForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('videoUrl', this.selectedFile);

      const title = this.videoForm.get('title')?.value;
      const description = this.videoForm.get('description')?.value;
      const status = this.videoForm.get('status')?.value;
      const analysisType = this.videoForm.get('analysisType')?.value;
      const recaptchaToken = this.videoForm.get('recaptcha')?.value;

      if (title && description && status && analysisType && recaptchaToken) {
        formData.append('title', title);
        formData.append('description', description);
        formData.append('status', status);
        formData.append('analysisType', analysisType);
        formData.append('recaptcha', recaptchaToken);

        this.videoservice.addVideoAnalysis(formData).subscribe(() => {
          this.videoForm.reset();
          this.selectedFile = null;
          this.router.navigateByUrl('getAllVideoAnalysis');
          Swal.fire('You informations!', 'saved with success', 'success');
        }, error => {
          alert('An error occurred while adding video.');
          console.error(error);
        });
      }
    } else {
      console.error('Form invalid or file not selected.');
    }
  }
}
