import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { WsSubscription } from './base/ws-subscription.class';

export interface TickerData {
  instrument_name: string;
  subscription: string;
  channel: 'ticker';
  data: TickerDataValues[];
}

export interface TickerDataValues {
  h: number; // Price of the 24h highest trade
  v: number; // The total 24h traded volume
  a: number; // The price of the latest trade, null if there weren't any trades
  l: number; // Price of the 24h lowest trade, null if there weren't any trades
  b: number; // The current best bid price, null if there aren't any bids
  k: number; // The current best ask price, null if there aren't any asks
  c: number; // 24-hour price change, null if there weren't any trades
  t: number; // update time
}

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  private streams: {
    [key: string]: WsSubscription<TickerData>;
  } = {};

  constructor() {}

  stream(instrument: string) {
    return this.getSubscription(instrument).data$;
  }

  getSubscription(instrument: string) {
    if (!this.streams[instrument]) {
      this.streams[instrument] = new WsSubscription(
        `ticker`,
        'subscribe',
        'unsubscribe',
        `data-${instrument}`,
        instrument,
        instrument
      );
    }
    return this.streams[instrument];
  }

  getHistoricalData(instrument: string): Observable<TickerData[]> {
    return new Observable((subscriber) => {
      const stream = this.getSubscription(instrument);
      stream.once('get-instrument-history-data-' + instrument, (data) => {
        subscriber.next(data.map(this.getHistoricalDataMapper()));
        subscriber.complete();
      });
      stream.send('get-instrument-history', { instrument });
    });
  }

  private getHistoricalDataMapper() {
    return (dat: any) => ({
      instrument_name: 'string',
      subscription: 'string',
      channel: 'ticker',
      data: [
        {
          a: dat.trade,
          b: dat.bid,
          c: dat.change,
          h: dat.high,
          k: dat.ask,
          l: dat.last,
          t: new Date(dat.time).getTime(),
          v: dat.volume,
        },
      ],
    });
  }
}
