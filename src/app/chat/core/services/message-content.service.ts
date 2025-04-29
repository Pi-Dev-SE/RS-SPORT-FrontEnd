import { Injectable } from '@angular/core';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MessageContent } from '../interfaces/message-content';
import { User } from '../interfaces/user-chat';
import SockJS from 'sockjs-client';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageContentService {

  private apiUrl = 'http://localhost:8088/spr01/api/v1/messagecontents';

  private webSocketURL = 'http://localhost:8088/spr01/api/ws';
  private stompClient: CompatClient = {} as CompatClient;
  private messageContentSubject = new Subject<MessageContent>(); // BehaviorSubject of User type. You can know when a new comment is received.
  private subscriptionMessage: any;

  constructor(
    private http: HttpClient
  ) { }


  connect(firstname: string) {
    if(this.stompClient.connected) return;

    const socket = new SockJS(this.webSocketURL);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect(
      {},
      () => this.subscribeMessages(firstname),
      (error: string) => this.onError(error)
    );
  }


  connectWithCallback(firstname: string, callback: () => void) {
    if(this.stompClient.connected) return;

    const socket = new SockJS(this.webSocketURL);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect(
      {},
      () => {
        this.subscribeMessages(firstname);
        callback();
      },
      (error: string) => this.onError(error)
    );
  }


  private subscribeMessages(firstname?: string) {
    this.subscriptionMessage = this.stompClient.subscribe(`/user/${firstname}/queue/messages`, (message: any) => {
      this.messageContentSubject.next(JSON.parse(message.body));
    });
  }


  private onError(error: any) {
    console.log('Error: ' + error);
  }


  disconnect() {
    this.stompClient.disconnect(() => {
      console.log('Disconnected');
    });
    this.subscriptionMessage.unsubscribe();
  }


  subscribeMessageContent(): Observable<MessageContent> {
    return this.messageContentSubject.asObservable();
  }


  sendMessage(message: MessageContent) {
    this.sendMessageThroughComponent(message);
    this.stompClient.send('/app/send-message', {}, JSON.stringify(message));
  }


  sendMessageThroughComponent(message: MessageContent) {
    this.messageContentSubject.next(message);
  }


  getMessagesByRoomId(roomId?: string) {
    const url = `${this.apiUrl}/${roomId}`;
    return this.http.get<MessageContent[]>(url);
  }

}
