import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageRoom } from '../interfaces/message-room';

@Injectable({
  providedIn: 'root'
})

export class MessageRoomService {

  private apiUrl = 'http://localhost:8088/spr01/api/v1/messagerooms';


  constructor(
    private http: HttpClient
  ) { }


  findMessageRoomByMembers(members: string[]): Observable<MessageRoom> {
    const url = this.apiUrl + '/find/chat-room';
    const params = {
      members: members
    };
    return this.http.get(url, { params });
  }


  findMessageRoomsByMember(firstname: string): Observable<MessageRoom[]> {
    const url = `${this.apiUrl}/chat-rooms/${firstname}`;
    return this.http.get<MessageRoom[]>(url);
  }


  findById(currentUsername?: string, id?: string): Observable<MessageRoom> {
    const url = `${this.apiUrl}/${id}/${currentUsername}`;
    return this.http.get<MessageRoom>(url);
  }


  createMessageRoom(currentUsername: string, members: string[]): Observable<MessageRoom> {
    const url = this.apiUrl + '/create/chat-room';
    const params = new HttpParams()
      .set('currentUsername', currentUsername)
      .set('members', members.join(','));
    return this.http.post(url, null, { params });
  }


  updateGroupName(id: string, name: string): Observable<MessageRoom> {
    const url = `${this.apiUrl}/update-group-name/${id}`;
    return this.http.post<MessageRoom>(url, name);
  }

}
