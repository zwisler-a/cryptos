import { Observable, Subject } from 'rxjs';
import { finalize, share, shareReplay } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';

interface SubscriptionPair<T> {
  subject: Subject<T>;
  observable: Observable<T>;
}

export class WsSubscription<T> {
  static readonly sockets: { [key: string]: Socket } = {};
  protected socket: Socket;
  protected subscriptionPair: SubscriptionPair<T> | undefined;
  protected connected = false;
  private queue: { event: string; data: any }[] = [];

  constructor(
    protected namespace: string,
    protected subscribeEvent: string = 'subscribe',
    protected unsubscribeEvent: string = 'unsubscribe',
    protected dataEvent: string = `data`,
    protected subscribeEventData: any = null,
    protected unsubscribeEventData: any = null
  ) {
    if (WsSubscription.sockets[namespace]) {
      this.socket = WsSubscription.sockets[namespace];
      this.connected = this.socket.connected;
    } else {
      this.socket = io(`/${namespace}`);
      WsSubscription.sockets[namespace] = this.socket;
    }
    this.socket.io.on('reconnect', this.onReconnected.bind(this));
    this.socket.on('connect', this.onConnected.bind(this));
    this.socket.on('disconnect', this.onDisonnected.bind(this));
    this.socket.on(dataEvent, this.handleData.bind(this));
  }

  get data$() {
    if (!this.subscriptionPair) {
      this.subscriptionPair = this.createSubscriptionPair(() => {
        this.send(this.unsubscribeEvent, this.unsubscribeEventData);
        this.subscriptionPair = undefined;
      });
      this.send(this.subscribeEvent, this.subscribeEventData);
    }
    return this.subscriptionPair.observable;
  }

  protected onReconnected() {
    if (this.subscriptionPair) {
      this.send(this.subscribeEvent, this.subscribeEventData);
    }
  }

  protected onConnected() {
    this.connected = true;
    this.queue.forEach((que) => {
      this.send(que.event, que.data);
    });
    this.queue = [];
  }
  protected onDisonnected(reason: any) {
    this.connected = false;
  }

  protected handleData(event: T) {
    if (this.subscriptionPair) {
      this.subscriptionPair.subject.next(event);
    }
  }

  public send(event: string, data: any = null) {
    if (this.connected) {
      this.socket.emit(event, data);
    } else {
      console.log('Queuing request', event);
      this.queue.push({ event, data });
    }
  }

  private createSubscriptionPair(final: () => void): SubscriptionPair<T> {
    const subject = new Subject<T>();
    const observable = subject.pipe(share(), finalize(final));

    return { observable, subject };
  }

  once(event: string, func: (data: any) => void) {
    this.socket.once(event, func);
  }
}
