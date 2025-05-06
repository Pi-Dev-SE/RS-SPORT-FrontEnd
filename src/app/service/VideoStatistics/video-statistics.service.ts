import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoStatisticsService {
private apiBasePath ="http://localhost:8088/spr01/api/video-statistics";

  constructor(private http:HttpClient) { }


  addVideoStatistics(video: any): Observable<any> {
    return this.http.post<any>(`${this.apiBasePath}/createVideoStatistic`,video);
  }

  GetAllVideoStatistics(){
    return this.http.get(`${this.apiBasePath}/getAllVideoStatistics`);
  }




  GetVideoStatisticsById(id: any) {
    return this.http.get(this.apiBasePath+"/getVideoStatisticsById/"+id) ;
  }

  deleteVideoStatistics(videoAnalysisId:any){
    return this.http.delete<any>(`${this.apiBasePath}/deleteVideoStatistics/${videoAnalysisId}`);
  }



}
