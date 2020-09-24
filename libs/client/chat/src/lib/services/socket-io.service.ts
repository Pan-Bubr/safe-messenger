// tslint:disable:typedef

import { Injectable } from '@angular/core';
import { AuthService } from '@safe-messenger/client/login';

import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

export interface SocketIoConfig {
  url: string;
  options?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public subscribersCounter: number = 0;
  public ioSocket: io.Socket;

  constructor(private readonly authService: AuthService) {
    const config: SocketIoConfig = {
      url: 'http://localhost:3333',
      options: {
        reconnect: true,
        query: {
          jwtToken: authService.getToken()
        }
      }
    };
    const url: string = config.url || '';
    const options: any = config.options || {};
    this.ioSocket = io.connect(url, options);
  }

  public on(eventName: string, callback: Function) {
    this.ioSocket.on(eventName, callback);
  }

  public once(eventName: string, callback: Function) {
    this.ioSocket.once(eventName, callback);
  }

  public connect() {
    return this.ioSocket.connect();
  }

  public disconnect(close?: any) {
    return this.ioSocket.disconnect.apply(this.ioSocket, arguments);
  }

  public emit(eventName: string, data: any, callback?: Function) {
    return this.ioSocket.emit(eventName, data);
  }

  public removeListener(eventName: string, callback?: Function) {
    return this.ioSocket.removeListener.apply(this.ioSocket, arguments);
  }

  public removeAllListeners(eventName?: string) {
    return this.ioSocket.removeAllListeners.apply(this.ioSocket, arguments);
  }

  /** create an Observable from an event */
  public fromEvent<T>(eventName: string): Observable<T> {
    this.subscribersCounter++;

    return new Observable((observer: any) => {
      this.ioSocket.on(eventName, (data: T) => {
        observer.next(data);
      });

      return () => {
        if (this.subscribersCounter === 1) {
          this.ioSocket.removeListener(eventName);
        }
      };
    });
  }
}
