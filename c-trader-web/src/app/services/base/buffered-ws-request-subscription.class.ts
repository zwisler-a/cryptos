import { Observable } from 'rxjs';
import { debounceTime, map, share, throttleTime } from 'rxjs/operators';

import { WsSubscription } from './ws-subscription.class';

export class BufferedWsRequestSubscription<T> {
  private buffer: T[] = [];
  private _data$;

  constructor(
    private wsSubscription: WsSubscription<T>,
    private bufferSize: number,
    requestEvent: string = 'request',
    requestDataEvent: string = 'request-data',
    private requestData: any = null,
    mapper: (data: any) => T[]
  ) {
    this.wsSubscription.once(requestDataEvent, (data) => {
      this.buffer = mapper(data);
    });
    this.wsSubscription.send(requestEvent, this.requestData);
    this._data$ = this.createData$();
  }

  private createData$(): Observable<T[]> {
    return this.wsSubscription.data$.pipe(
      throttleTime(5000),
      map((data) => {
        this.buffer.push(data);
        if (this.buffer.length > this.bufferSize) {
          this.buffer.shift();
        }
        return this.buffer;
      }),
      share()
    );
  }

  get data$() {
    return this._data$;
  }
}
