import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PostService {

  private apiBasePath ="http://localhost:8089/spr01/api/posts";

  constructor(private http:HttpClient) { }

  createNewPost(formData: FormData): Observable<any> {
    console.log("formData",formData);
    return this.http.post<any>(`${this.apiBasePath}/createPost`,formData);
  }
  getAllPosts() {

    return this.http.get(`${this.apiBasePath}/getAllPosts`);
  }

  getPostById(idPost:any) {

    return this.http.get(`${this.apiBasePath}/getPostById/${idPost}`) ;
  }

  deletePost(idPost:any){
    return this.http.delete<any>(`${this.apiBasePath}/deletePost/${idPost}`);
  }

  searchByName(clubName:String): Observable<any> {
    return this.http.get(`${this.apiBasePath}/search/${clubName}` );
  }

  logSearch(text: string) {
    return this.http.post('logSearch', text, {
      responseType: 'text'
    });
  }


  UpdatePost(Post: FormData, idPost: any) {
    return this.http.put(`${this.apiBasePath}/updatePost/${idPost}`, Post);
  }


}
