import { CryptoRestRequest } from '../rest-request.interface';

export class PublicGetCandlestick extends CryptoRestRequest<PublicGetCandlestickResponse> {
  constructor(instrument: string, timeframe: string, depth?: string) {
    super();
    this.method = 'get';
    this.url = 'v2/public/get-candlestick';
    this.params = {
      instrument_name: instrument,
      timeframe,
      depth,
    };
  }
}

export class PublicGetCandlestickResponse {
  instrument_name: string; //	e.g. ETH_CRO, BTC_USDT
  interval: string; //	The period (e.g. 5m)
  data: {
    t: number; //	End time of candlestick (Unix timestamp)
    o: number; //Open
    h: number; //High
    l: number; //Low
    c: number; //Close
    v: number; //	Volume
  }[];
}
