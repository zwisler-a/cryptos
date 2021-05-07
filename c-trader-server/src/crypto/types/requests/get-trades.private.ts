import { CryptoRequest } from '../request.interface';

export class PrivateGetTrades extends CryptoRequest<PrivateGetTradesResponse> {
  method = 'private/get-trades';
  params: {
    instrument_name?: string;
    page_size?: number;
    page?: number;
    start_ts?: number;
    end_ts?: number;
  } = {};
}
import { CryptoResponse } from '../response.interface';

export interface PrivateGetTradesResponse extends CryptoResponse {
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
  };
}
