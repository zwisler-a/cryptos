import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, share } from 'rxjs/operators';

import { WsSubscription } from './base/ws-subscription.class';
import { TickerService } from './ticker.service';

export interface CandlestickData {
  instrument_name: string; // instrument_name
  interval: string;
  data: {
    i?: string;
    o: number; // open
    c: number; // close
    h: number; // high
    l: number; // low
    v: number; // volume
    t: number; // start time of the stick, in epochtime
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class CandlestickService {
  private streams: { [key: string]: WsSubscription<CandlestickData> } = {};

  constructor() {}

  stream(interval: string, instrument: string): Observable<CandlestickData> {
    const key = `${interval}_${instrument}`;
    if (!this.streams[key]) {
      this.streams[key] = new WsSubscription(
        `candlestick`,
        undefined,
        undefined,
        `candlestick-data-${instrument}-${interval}`,
        { instrument, interval },
        { instrument, interval }
      );
    }
    return this.streams[key].data$;
  }


}
