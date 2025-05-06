import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


const BASIC_URL = 'http://localhost:8088/spr01/api/comments';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }


  createComment(postId:number, postedBy: string, content:string) :Observable<any>{
    const params={
      postId: postId,
      postedBy: postedBy
    }
    return this.http.post<any>(BASIC_URL + `/createComment` , content, {params});
  }


  getAllCommentsByPost(postId: number): Observable<any> {
    return this.http.get(BASIC_URL +  `/getCommentsByPostId/${postId}`);
  }

  deleteComment(idComment:any):Observable<any> {
    return this.http.delete(BASIC_URL + `/deleteComment/${idComment}`);
  }


}
