import { CryptoRequest } from '../request.interface';

export class PublicGetInstuments extends CryptoRequest<PublicGetInstumentsResponse> {
  method = 'public/get-instruments';
}
import { CryptoResponse } from '../response.interface';

export interface PublicGetInstumentsResponse extends CryptoResponse {
  result: {
    instruments: {
      instrument_name: string;
      quote_currency: string;
      base_currency: string;
      price_decimals: number;
      quantity_decimals: number;
      margin_trading_enabled: boolean;
    }[];
  };
}
