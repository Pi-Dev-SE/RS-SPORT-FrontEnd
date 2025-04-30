import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user-chat';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { catchError, Observable, of, Subject, tap } from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private apiUrl = 'http://localhost:8088/spr01/api/v1/users';

  private webSocketURL = 'http://localhost:8088/spr01/api/ws';
  private stompClient: CompatClient = {} as CompatClient;
  public userSubject = new Subject<User>(); // BehaviorSubject of User type. You can know when a new comment is received.
  private subscriptionActiveUsers: any;

  activeUsers: {
    [key: string]: string;
  } = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE'
  }


  constructor(
    private http: HttpClient
  ) { }


  login(user: User): Observable<User> {
    return this.http.post(this.apiUrl, user);
  }


  saveToLocalStorage(user: User) {
    localStorage.setItem('user', JSON.stringify(
      {
        firstname: user.firstname,
        avatarUrl: user.avatarUrl
      }
    ));
  }


  getFromLocalStorage(): User {
    return JSON.parse(localStorage.getItem('user') ?? '{}');
  }


  removeLocalStorage() {
    localStorage.removeItem('user');
  }


  subscribeActiveUsers(): Observable<User> {
    return this.userSubject.asObservable();
  }


  connect(user: User) {
    const socket = new SockJS(this.webSocketURL);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect(
      {},
      () => this.onConnect(user),
      (error: string) => this.onError(error)
    );
  }


  private onConnect(user: User) {
    this.subscribeActive();
    this.sendUserConnect(user);
  }


  private subscribeActive() {
    this.subscriptionActiveUsers = this.stompClient.subscribe('/topic/active', (message: any) => {
      const user = JSON.parse(message.body);
      this.userSubject.next(user);
      this.setActiveUserStatus(user.firstname, user.status);
    });
  }


  private sendUserConnect(user: User) {
    this.stompClient.send(
      '/app/user/connect',
      {},
      JSON.stringify(user));
  }


  private onError(error: any) {
    console.log('Error: ' + error);
  }


  disconnect(user: User) {
    this.sendUserDisconnect(user);
    this.stompClient.disconnect(() => {
      console.log('Disconnected');
    });
    this.subscriptionActiveUsers.unsubscribe();
  }


  private sendUserDisconnect(user: User) {
    this.stompClient.send(
      '/app/user/disconnect',
      {},
      JSON.stringify(user));
  }


  getOnlineUsers(): Observable<User[]> {
    const url = this.apiUrl + '/online';
    return this.http.get<User[]>(url);
  }


  searchUsers(firstname: string, excludeUsers?: User[]): Observable<User[]> {
    const url = this.apiUrl + '/search-with-exclusion/' + firstname;
    return this.http.post<User[]>(url, excludeUsers);
  }




  setActiveUserStatus(firstname: string, status: string) {
    this.activeUsers[firstname] = status;
  }


  getUserStatus(firstname?: string): Observable<string | undefined> {
    if (!firstname) return of('OFFLINE');
    if (this.activeUsers[firstname] === undefined) {
      return this.getUserStatusFromBackend(firstname).pipe(
        tap((status: string) => {
          this.activeUsers[firstname] = status;
          return status;
        }),
        catchError((error: any) => {
          console.error(error);
          return of(undefined);
        })
      );
    } else {
      return of(this.activeUsers[firstname]);
    }
  }


  getUserStatusFromBackend(firstname?: string): Observable<string> {
    const url = this.apiUrl + '/status/' + firstname;
    return this.http.get<string>(url);
  }


  getLastLogin(firstname: string): Observable<string> {
    const url = this.apiUrl + '/lastlogin/' + firstname;
    return this.http.get<string>(url);
  }


  uploadAvatar(formData: FormData): Observable<User> {
    const url = this.apiUrl + '/avatar';
    return this.http.post<User>(url, formData);
  }

}
