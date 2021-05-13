import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WsSubscription } from './base/ws-subscription.class';

export interface BalanceHistroyData {
  id: string;
  currency: string;
  value: number;
  value_in_usdt: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class TotalBalanceService {
  private wsSubscription = new WsSubscription<BalanceHistroyData>('balance');
  readonly stream$ = this.wsSubscription.data$;

  constructor() {}

  getHistoricalData(
    currency: string = 'USDT_TOTAL',
    timespan: number = 60,
    interval: number = 1
  ): Observable<BalanceHistroyData[]> {
    return new Observable((subscriber) => {
      this.wsSubscription.once('get-history-data-' + currency, (data) => {
        subscriber.next(data);
        subscriber.complete();
      });
      this.wsSubscription.send('get-history', { currency, timespan, interval });
    });
  }
}
