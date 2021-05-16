import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface TradesData {
  side: 'SELL' | 'BUY';
  instrument_name: string;
  fee: number;
  trade_id: string;
  create_time: number;
  traded_price: number;
  traded_quantity: number;
  fee_currency: string;
  order_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class TradesService {
  // private wsSubscription = new BufferedWsSubscription<TradesData>('trades', 20);
  constructor() {}

  stream() {
    return new Observable();
  }
}
