import { Component } from '@angular/core';
import { VideoAnalysisService } from '../../../service/VideoAnalysis/video-analysis.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-all-video-analysis',
  templateUrl: './get-all-video-analysis.component.html',
  styleUrls: ['./get-all-video-analysis.component.css'] // fixed typo: 'styleUrl' → 'styleUrls'
})
export class GetAllVideoAnalysisComponent {
  videos: any;
  searchText: string = '';
  p: number = 1; // for pagination current page

  constructor(
    private videoAnalysisService: VideoAnalysisService,
    private router: Router
  ) {}

  ngOnInit() {
    this.GetVideos();
  }

  GetVideos(): void {
    this.videoAnalysisService.GetAllVideoAnalysis().subscribe(
      (data) => {
        this.videos = data;
        console.log("data : ", data);
      },
      (error) => {
        console.error('Error fetching List videos:', error);
      }
    );
  }

  onSearch() {
    if (this.searchText.trim() === '') {
      this.GetVideos();
    } else {
      this.videoAnalysisService.searchByName(this.searchText.trim()).subscribe(
        (res) => {
          this.videos = res;
        },
        (error) => {
          console.log('Search failed', error);
        }
      );
    }
  }
}
