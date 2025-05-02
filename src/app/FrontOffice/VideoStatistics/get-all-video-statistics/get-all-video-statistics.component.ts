import { Component } from '@angular/core';
import { VideoStatisticsService } from '../../../service/VideoStatistics/video-statistics.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-get-all-video-statistics',
  templateUrl: './get-all-video-statistics.component.html',
  styleUrl: './get-all-video-statistics.component.css'
})
export class GetAllVideoStatisticsComponent {
videos:any;
  constructor(private videoStatisticsService :VideoStatisticsService ,
              private router:Router
  ){}

ngOnInit(){
 this.GetVideos();
}

GetVideos(): void {

  this.videoStatisticsService.GetAllVideoStatistics().subscribe(
    (data) => {
      this.videos = data;
      console.log("data : ",data)
    },
    (error) => {
      console.error('Error fetching List videos:', error);
    }
  );
}
}
