import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { WsSubscription } from './base/ws-subscription.class';

export interface InstrumentData {
  instrument_name: string;
  quote_currency: string;
  base_currency: string;
  price_decimals: number;
  quantity_decimals: number;
  margin_trading_enabled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class InstrumentService {
  private wsSubscription = new WsSubscription<InstrumentData[]>('instrument');

  constructor() {}

  stream(): Observable<InstrumentData[]> {
    return this.wsSubscription.data$.pipe(shareReplay(1));
  }
}
