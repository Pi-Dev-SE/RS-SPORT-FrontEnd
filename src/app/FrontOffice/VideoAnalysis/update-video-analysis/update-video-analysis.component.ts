import { Component } from '@angular/core';
import { VideoAnalysisService } from '../../../service/VideoAnalysis/video-analysis.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-video-analysis',
  templateUrl: './update-video-analysis.component.html',
  styleUrl: './update-video-analysis.component.css',
})
export class UpdateVideoAnalysisComponent {
  videoId = this.activatedRoute.snapshot.params['id'];
  videoData: any;
  videoForm!: FormGroup;
  videoActuel: any;
  selectedVideoFile: File | null = null;

  constructor(
    private video: VideoAnalysisService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.videoForm = this.fb.group({
      title: [''],
      description: [''],
      videoUrl: [''],
      analysisType: [''],
      status: ['']

    });
    console.log(this.videoId);
    this.GetVideoAnalysisById();
  }

  patchform() {
    this.videoForm.patchValue({
      title: this.videoActuel.title,
      description: this.videoActuel.description,
      videoUrl: this.videoActuel.videoUrl,
      analysisType: this.videoActuel.analysisType,
      status: this.videoActuel.status
    });
  }

  GetVideoAnalysisById() {
    this.video.GetVideoAnalysisById(this.videoId).subscribe(
      (response) => {
        this.videoData = response;
        this.videoActuel = response; // ✅ Assurez-vous d'affecter la valeur ici
        console.log(response);
        this.patchform(); // ✅ Appel de `patchform()` après récupération des données
      },
      (error) => {
        console.error("Erreur lors de la récupération des données", error);
      }
    );
  }


  /*
  clickUpdateVideo() {

    //console.log("adresse", this.updateform.value.adresse)
    //console.log("aaa ",this.utilisateuractuel.id)
    this.video.Update(this.videoForm.value , this.videoActuel.videoAnalysisId).subscribe((res: any) => {
      this.router.navigateByUrl('getAllVideoAnalysis')
      console.log("succes", res);
      Swal.fire(
        'You informations!',
        'updated with success',
        'success'
      )

     // this.router.navigateByUrl['/home/profil']
      //this.getbyid();

    })
  }*/

    onVideoSelected(event: any) {
      this.selectedVideoFile = event.target.files[0];
    }



clickUpdateVideo() {
  const formData = new FormData();

  formData.append('title', this.videoForm.get('title')?.value);
  formData.append('description', this.videoForm.get('description')?.value);
  formData.append('analysisType', this.videoForm.get('analysisType')?.value);
  formData.append('status', this.videoForm.get('status')?.value);

  if (this.selectedVideoFile) {
    formData.append('videoUrl', this.selectedVideoFile);
  }

  this.video.Update(formData, this.videoActuel.videoAnalysisId).subscribe({
    next: (res: any) => {
      this.router.navigateByUrl('getAllVideoAnalysis');
      Swal.fire('You informations!', 'Updated with success', 'success');
    },
    error: (err) => {
      console.error('Update failed', err);
      Swal.fire('Error', 'Update failed', 'error');
    }
  });
}


}
