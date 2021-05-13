import { CryptoRequest } from '../request.interface';

export class PrivateGetOrderHistory extends CryptoRequest<PrivateGetOrderHistoryResponse> {
  method = 'private/get-order-history';
  params: {
    instrument_name?: string;
    start_ts?: number;
    end_ts?: number;
    page_size?: number;
    page?: number;
  } = {};
  constructor(
    instrument_name?: string,
    start_ts?: number,
    end_ts?: number,
    page_size?: number,
    page?: number,
  ) {
    super();
    this.params = {
      instrument_name,
      start_ts,
      end_ts,
      page_size,
      page,
    };
  }
}

import { CryptoResponse } from '../response.interface';

export interface PrivateGetOrderHistoryResponse extends CryptoResponse {
  result: {
    order_list: {
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
      time_in_force:
        | 'GOOD_TILL_CANCEL'
        | 'FILL_OR_KILL'
        | 'IMMEDIATE_OR_CANCEL';
      exec_inst?: string; //Empty or POST_ONLY (Limit Orders Only)
      trigger_price?: number; //	Used for trigger-related orders
    }[];
  };
}
