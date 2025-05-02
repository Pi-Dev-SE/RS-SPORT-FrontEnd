import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoAnalysisService {

  private apiBasePath ="http://localhost:8089/spr01/api/videos";

  constructor(private http:HttpClient) { }

  addVideoAnalysis(formData: FormData): Observable<any> {
    console.log("formData",formData);
    return this.http.post<any>(`${this.apiBasePath}/createVideo`,formData);
  }

  GetAllVideoAnalysis(){
    return this.http.get(`${this.apiBasePath}/getAllVideos`);
  }

  GetVideoAnalysisById(id: any) {
    return this.http.get(this.apiBasePath+"/getVideoById/"+id) ;
  }

  deleteVideo(videoAnalysisId:any){
    return this.http.delete<any>(`${this.apiBasePath}/deleteVideo/${videoAnalysisId}`);
  }

  Update(video:any,videoAnalysisId:any){
    return this.http.put(`${this.apiBasePath}/updateVideo/${videoAnalysisId}`,video)
  }

  searchByName(title:String): Observable<any> {
    return this.http.get(`${this.apiBasePath}/search/${title}` );
  }

}
