import { Injectable } from '@angular/core';
import { Client, Stomp } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
//import SockJS from 'sockjs-client/dist/sockjs';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient: Client | undefined;
  private notifications = new Subject<string>();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    const socket = new SockJS('http://localhost:8088/spr01/ws'); // Utilisation de SockJS
    this.stompClient = Stomp.over(socket);

    this.stompClient.reconnectDelay = 5000; // Auto-reconnexion
    this.stompClient.debug = (str: string) => console.log('STOMP: ' + str);

    this.stompClient.onConnect = () => {
      console.log('✅ WebSocket connecté avec succès !');
      // S'abonner au topic des notifications
      this.stompClient?.subscribe('/topic/notifications', (message) => {
        console.log('📩 Notification reçue :', message.body);
        this.notifications.next(message.body);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Erreur STOMP:', frame.headers['message']);
      console.error('Détails:', frame.body);
      alert('Erreur STOMP: ' + frame.headers['message']);
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.warn('⚠️ WebSocket fermé:', event);
    };

    this.stompClient.activate();
  }

  getNotifications(): Observable<string> {
    return this.notifications.asObservable();
  }
}
