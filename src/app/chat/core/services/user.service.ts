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

  private webSocketURL = 'http://localhost:8088/spr01/ws';
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
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap((response: User) => {
        // Si l'utilisateur n'a pas de prénom, utiliser la partie locale de l'email
        if (!response.firstname && response.email) {
          response.firstname = response.email.split('@')[0];
        }
        // Sauvegarder l'utilisateur dans le localStorage
        this.saveToLocalStorage(response);
      })
    );
  }


  saveToLocalStorage(user: User) {
    // Vérifier si les données utilisateur existent déjà dans le localStorage principal
    const existingUserData = localStorage.getItem('user_data');

    if (existingUserData) {
      // Si les données existent, les mettre à jour avec les informations du chat
      const parsedUser = JSON.parse(existingUserData);
      parsedUser.firstname = user.firstname || parsedUser.firstname;
      localStorage.setItem('user_data', JSON.stringify(parsedUser));
    } else {
      // Sinon, créer une nouvelle entrée dans le localStorage pour le chat
      localStorage.setItem('user', JSON.stringify({
        firstname: user.firstname,
        email: user.email,
        avatarUrl: user.avatarUrl
      }));
    }
  }


  getFromLocalStorage(): User {
    // Récupérer les données utilisateur depuis le localStorage
    const userData = localStorage.getItem('user_data') ?? localStorage.getItem('user') ?? '{}';
    const parsedUser = JSON.parse(userData);

    // Créer un objet User compatible avec le module chat
    const chatUser: User = {
      firstname: parsedUser.firstname || parsedUser.name || (parsedUser.email ? parsedUser.email.split('@')[0] : ''),
      email: parsedUser.email || '',
      avatarUrl: parsedUser.avatarUrl || ''
    };

    // S'assurer que firstname n'est pas undefined ou vide
    if (!chatUser.firstname) {
      console.warn('Firstname est vide, utilisation d\'un nom par défaut');
      chatUser.firstname = 'Utilisateur';
    }

    return chatUser;
  }


  removeLocalStorage() {
    // Supprimer les données utilisateur du localStorage
    // On ne supprime pas user_data pour ne pas déconnecter l'utilisateur de l'application principale
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
    // S'assurer que l'utilisateur a un prénom avant de le connecter
    if (!user.firstname && user.email) {
      user.firstname = user.email.split('@')[0];
    } else if (!user.firstname) {
      user.firstname = 'Utilisateur';
    }
    this.subscribeActive();
    this.sendUserConnect(user);
  }


  private subscribeActive() {
    this.subscriptionActiveUsers = this.stompClient.subscribe('/topic/active', (message: any) => {
      const user = JSON.parse(message.body);

      // S'assurer que l'utilisateur a un prénom avant de le traiter
      if (!user.firstname && user.email) {
        user.firstname = user.email.split('@')[0];
      } else if (!user.firstname) {
        user.firstname = 'Utilisateur';
      }

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
    return this.http.get<User[]>(url).pipe(
      tap((users: User[]) => {
        // Traiter chaque utilisateur pour s'assurer qu'ils ont un prénom
        users.forEach(user => {
          if (!user.firstname && user.email) {
            user.firstname = user.email.split('@')[0];
          } else if (!user.firstname) {
            user.firstname = 'Utilisateur';
          }
        });
      })
    );
  }


  searchUsers(firstname: string, excludeUsers?: User[]): Observable<User[]> {
    const url = this.apiUrl + '/search-with-exclusion/' + firstname;
    return this.http.post<User[]>(url, excludeUsers).pipe(
      tap((users: User[]) => {
        // Traiter chaque utilisateur pour s'assurer qu'ils ont un prénom
        users.forEach(user => {
          if (!user.firstname && user.email) {
            user.firstname = user.email.split('@')[0];
          } else if (!user.firstname) {
            user.firstname = 'Utilisateur';
          }
        });
      })
    );
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
