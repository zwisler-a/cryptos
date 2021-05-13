import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WsSubscription } from './base/ws-subscription.class';

export interface OrderData {
  status: 'ACTIVE' | 'CANCELED' | 'FILLED' | 'REJECTED' | 'EXPIRED';
  reason?: string; //	Reason code (see "Response and Reason Codes") -- only for REJECTED orders
  side: 'BUY' | 'SELL';
  price: number; //	Price specified in the order
  quantity: number; //	Quantity specified in the order
  order_id: string; //	Order ID
  client_oid?: string; //	(Optional) Client order ID if included in request
  create_time: number; //	Order creation time (Unix timestamp)
  update_time: number; //	Order update time (Unix timestamp)
  type:
    | 'LIMIT'
    | 'MARKET'
    | 'STOP_LOSS'
    | 'STOP_LIMIT'
    | 'TAKE_PROFIT'
    | 'TAKE_PROFIT_LIMIT';
  instrument_name: string; //	e.g. ETH_CRO, BTC_USDT
  cumulative_quantity?: number; //	Cumulative executed quantity (for partially filled orders)
  cumulative_value?: number; //	Cumulative executed value (for partially filled orders)
  avg_price: number; //	Average filled price. If none is filled, returns 0
  fee_currency: string; //	Currency used for the fees (e.g. CRO)
  time_in_force: 'GOOD_TILL_CANCEL' | 'FILL_OR_KILL' | 'IMMEDIATE_OR_CANCEL';
  exec_inst?: string; //Empty or POST_ONLY (Limit Orders Only)
  trigger_price?: number; //	Used for trigger-related orders
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private wsSubscription = new WsSubscription<OrderData[]>('order');

  constructor() {}

  getOrders(instrument: string, days = 1): Observable<OrderData[]> {
    return new Observable((subscriber) => {
      this.wsSubscription.once('get-orders-data-' + instrument, (data) => {
        subscriber.next(data);
        subscriber.complete();
      });
      this.wsSubscription.send('get-orders', { instrument, days });
    });
  }
}
