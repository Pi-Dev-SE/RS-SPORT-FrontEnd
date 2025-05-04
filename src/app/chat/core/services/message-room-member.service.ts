import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageRoomMember } from '../interfaces/message-room-member';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user-chat';

@Injectable({
  providedIn: 'root'
})
export class MessageRoomMemberService {

  private apiUrl = 'http://localhost:8088/spr01/api/v1/messageroommembers';

  constructor(
    private http: HttpClient
  ) { }


  getRoomMembers(roomId?: string): Observable<MessageRoomMember[]> {
    const url = `${this.apiUrl}/${roomId}`;
    return this.http.get<MessageRoomMember[]>(url);
  }


  updateLastSeen(roomId: string, firstname: string): Observable<MessageRoomMember> {
    const url = `${this.apiUrl}/update-last-seen/${roomId}/${firstname}`;
    return this.http.post<MessageRoomMember>(url, {});
  }


  addMembers(roomId: string, members?: User[]): Observable<MessageRoomMember[]> {
    if(!members) return new Observable();
    const url = `${this.apiUrl}/${roomId}`;
    return this.http.post<MessageRoomMember[]>(url, members);
  }


  makeAdmin(roomId: string, firstname: string): Observable<MessageRoomMember> {
    const url = `${this.apiUrl}/make-admin/${roomId}/${firstname}`;
    return this.http.post<MessageRoomMember>(url, {});
  }


  removeAdmin(roomId: string, firstname: string): Observable<MessageRoomMember> {
    const url = `${this.apiUrl}/remove-admin/${roomId}/${firstname}`;
    return this.http.post<MessageRoomMember>(url, {});
  }


  removeMember(roomId: string, firstname: string): Observable<void> {
    const url = `${this.apiUrl}/remove-member/${roomId}/${firstname}`;
    return this.http.delete<void>(url);
  }

}
