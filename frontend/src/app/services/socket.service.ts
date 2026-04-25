import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl, {
      withCredentials: true
    });
  }

  // Listen for task updates
  onTaskUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('taskUpdated', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for category updates
  onCategoryUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('categoryUpdated', (data) => {
        observer.next(data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
