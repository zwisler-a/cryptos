import { Subscribe, Unsubscribe } from '../subscribe';

export class SubscribeTicker extends Subscribe<SubscriptionDataTicker> {
  marketApi = true;
  constructor(instrument?: string) {
    super(instrument ? `ticker.${instrument}` : `ticker`);
  }
}
export class UnsubscribeTicker extends Unsubscribe {
  marketApi = true;
  constructor(instrument: string) {
    super(`ticker.${instrument}`);
  }
}

export class SubscriptionDataTicker {
  instrument_name: string;
  subscription: string;
  channel: 'ticker';
  data: [
    {
      h: number; // Price of the 24h highest trade
      v: number; // The total 24h traded volume
      a: number; // The price of the latest trade, null if there weren't any trades
      l: number; // Price of the 24h lowest trade, null if there weren't any trades
      b: number; // The current best bid price, null if there aren't any bids
      k: number; // The current best ask price, null if there aren't any asks
      c: number; // 24-hour price change, null if there weren't any trades
      t: number; // update time
    },
  ];
}
