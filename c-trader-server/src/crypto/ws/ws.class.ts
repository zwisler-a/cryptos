import { Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import * as WebSocket from 'ws';

import {
  PublicHeartbeat,
  PublicRespondHeartbeat,
} from '../types/requests/response-heartbeat.public';

export class CryptoWs {
  protected logger = new Logger(CryptoWs.name);

  protected connected = false;
  protected reconnecting = false;
  protected queue: string[] = [];
  protected ws: WebSocket;

  protected _onOpen$ = new Subject<void>();
  protected _onClose$ = new Subject<number>();
  protected _onMessage$ = new Subject<any>();
  protected _onError$ = new Subject<any>();
  protected _onReconnect$ = new Subject<any>();
  onOpen$ = this._onOpen$.asObservable();
  onClose$ = this._onClose$.asObservable();
  onMessage$ = this._onMessage$.asObservable();
  onError$ = this._onError$.asObservable();
  onReconnect$ = this._onReconnect$.asObservable();
  constructor(protected url: string) {
    this.connect();
  }

  private connect() {
    this.logger.debug(`Open WS Connection to "${this.url}"`);
    this.ws = new WebSocket(this.url);
    this.ws.on('open', this.onOpen.bind(this));
    this.ws.on('close', this.onClose.bind(this));
    this.ws.on('error', this.onError.bind(this));
    this.ws.on('message', this.onMessage.bind(this));
  }

  send(data: string) {
    if (this.connected) {
      this.ws.send(data);
    } else {
      this.logger.debug(`[${this.url}] Queueing ${data}`);
      this.queue.push(data);
    }
  }

  private onOpen() {
    this.logger.debug(`Connected WS ${this.url}`);
    this.connected = true;
    if (this.reconnecting) {
      this._onReconnect$.next();
      this.reconnecting = false;
    }
    this.resendQueue();
    this._onOpen$.next();
  }

  private onClose(reason: number) {
    this.logger.log(`Disconnected WS "${this.url}": ${reason}`);
    this.connected = false;
    this.reconnect();
    this._onClose$.next(reason);
  }

  private onError(errorCode: any) {
    this.logger.error(`Error on WS "${this.url}": ${errorCode}`);
    this._onError$.next(errorCode);
  }

  private onMessage(data: WebSocket.Data) {
    const json = JSON.parse(data.toString());
    if (json.method === PublicHeartbeat.method)
      return this.handleHeartbeat(json);

    if (json.code !== 0) {
      return this.handleError(json);
    }
    this._onMessage$.next(json);
  }

  handleError(json: any) {
    if (json.code === 10004)
      return this.logger.error(
        `[${this.url}] ${json.code} BAD_REQUEST: ${json.message}`,
      );

    this.logger.error(`Unknown: ${JSON.stringify(json)}`);
  }

  protected reconnect() {
    this.reconnecting = true;
    this.logger.debug(`Reconnecting ...`);
    setTimeout(() => {
      try {
        this.ws.close();
      } catch (e) {
        this.logger.error(`Closing WS due to reconnect failed`, e);
      }
      this.connect();
    }, 500);
  }

  private handleHeartbeat(heartbeat: PublicHeartbeat) {
    const response = new PublicRespondHeartbeat();
    const filledResponse = {
      ...response,
      id: heartbeat.id,
    };
    this.ws.send(JSON.stringify(filledResponse));
  }

  protected resendQueue() {
    this.logger.debug(`Resending queue : ${this.queue.length} Messages`);
    this.queue.forEach((data) => {
      this.logger.debug(`Resending: ${data}`);
      this.send(data);
    });
    this.queue = [];
  }
}
