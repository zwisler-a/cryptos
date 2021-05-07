import { CryptoRequest } from '../request.interface';
import { CryptoResponse } from '../response.interface';

export class PrivateCreateOrder
  extends CryptoRequest<PrivateCreateOrderResponse> {
  method = 'private/create-order';
  params: {
    instrument_name?: string; //:Y; //e.g., ETH_CRO, BTC_USDT
    side?: string; //BUY, SELL
    type?:
      | 'LIMIT'
      | 'MARKET'
      | 'STOP_LOSS'
      | 'STOP_LIMIT'
      | 'TAKE_PROFIT'
      | 'TAKE_PROFIT_LIMIT'; //LIMIT, MARKET, STOP_LOSS, STOP_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT
    price?: number; //For LIMIT and STOP_LIMIT orders only:Unit price
    quantity?: number; //For LIMIT Orders, MARKET (SELL), STOP_LOSS (SELL) orders only:Order Quantity to be Sold
    notional?: number; //For MARKET (BUY) and STOP_LOSS (BUY) orders only:Amount to spend
    client_oid?: string; //Optional Client order ID
    time_in_force?: string; //(Limit Orders Only)
    exec_inst?: string; //(Limit Orders Only)
    trigger_price?: number; //Used with STOP_LOSS, STOP_LIMIT, TAKE_PROFIT, and TAKE_PROFIT_LIMIT orders.
  } = {};
}

export interface PrivateCreateOrderResponse extends CryptoResponse {
  result: {
    order_id: string;
    client_oid: string;
  };
}
