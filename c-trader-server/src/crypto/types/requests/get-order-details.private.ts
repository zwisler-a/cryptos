import { CryptoRequest } from '../request.interface';

export class PrivateGetOrderDetails extends CryptoRequest<PrivateGetOrderDetailsResponse> {
  method = 'private/get-order-detail';
  params: {
    order_id?: string;
  } = {};
  constructor(order_id: string) {
    super();
    this.params = { order_id };
  }
}

import { CryptoResponse } from '../response.interface';

export interface PrivateGetOrderDetailsResponse extends CryptoResponse {
  result: {
    trade_list: {
      side: 'SELL' | 'BUY';
      instrument_name: string;
      fee: number;
      trade_id: string;
      create_time: number;
      traded_price: number;
      traded_quantity: number;
      fee_currency: string;
      order_id: string;
    }[];
    order_info: {
      status: 'ACTIVE' | 'CANCELED' | 'FILLED' | 'REJECTED' | 'EXPIRED';
      reason?: string;
      side: 'BUY' | 'SELL';
      price: number;
      quantity: number;
      order_id: string;
      client_oid: string;
      create_time: number;
      update_time: number;
      type:
        | 'LIMIT'
        | 'MARKET'
        | 'STOP_LOSS'
        | 'STOP_LIMIT'
        | 'TAKE_PROFIT'
        | 'TAKE_PROFIT_LIMIT';
      instrument_name: string;
      cumulative_quantity: number;
      cumulative_value: number;
      avg_price: number;
      fee_currency: string;
      time_in_force:
        | 'GOOD_TILL_CANCEL'
        | 'FILL_OR_KILL'
        | 'IMMEDIATE_OR_CANCEL';
      exec_inst: 'POST_ONLY';
      trigger_price: number;
    };
  };
}
