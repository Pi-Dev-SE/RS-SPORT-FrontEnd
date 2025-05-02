import { Component } from '@angular/core';
import { VideoAnalysisService } from '../../../service/VideoAnalysis/video-analysis.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-get-video-analysis-by-id',
  templateUrl: './get-video-analysis-by-id.component.html',
  styleUrls: ['./get-video-analysis-by-id.component.css'],
})
export class GetVideoAnalysisByIdComponent {
  videoId = this.activatedRoute.snapshot.params['id'];
  videoData: any;
  videoSafeUrl: SafeResourceUrl | undefined;

  constructor(
    private video: VideoAnalysisService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    console.log(this.videoId);
    this.getPostById();
  }

  getPostById() {
    this.video.GetVideoAnalysisById(this.videoId).subscribe(
      (response) => {
        this.videoData = response;
        this.videoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          'http://localhost/video_upload/' + this.videoData.videoUrl
        );
      },
      (error) => {
        console.error('Error loading video analysis by ID', error);
      }
    );
  }

  delete(videoAnalysisId: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.video.deleteVideo(videoAnalysisId).subscribe((response) => {
          console.log('Deleted result = ', response);
          this.router.navigateByUrl('getAllVideoAnalysis');
        });
        Swal.fire('Deleted!', 'Your video has been deleted.', 'success');
      }
    });
  }
}
