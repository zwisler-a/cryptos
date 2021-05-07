import { map, shareReplay } from 'rxjs/operators';

import { WsSubscription } from './ws-subscription.class';

export class BufferedWsSubscription<T> extends WsSubscription<T[]> {
  private buffer: T[] = [];
  private _data$;

  constructor(
    namespace: string,
    private bufferSize: number,
    subscribeEvent: string = 'subscribe',
    unsubscribeEvent: string = 'unsubscribe',
    dataEvent: string = `data`
  ) {
    super(namespace, subscribeEvent, unsubscribeEvent, dataEvent);
    this._data$ = this.createData$();
  }

  private createData$() {
    return super.data$.pipe(
      map((data) => {
        this.buffer.push(...data);
        this.buffer.splice(
          0,
          Math.max(this.buffer.length - this.bufferSize, 0)
        );
        return this.buffer;
      }),
      shareReplay(1)
    );
  }

  get data$() {
    return this._data$;
  }
}
