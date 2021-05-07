import { Subscribe, Unsubscribe } from '../subscribe';

export class SubscribeCandlestick extends Subscribe<SubscriptionDataCandlestick> {
  marketApi = true;
  constructor(interval: string, instrument: string) {
    super(`candlestick.${interval}.${instrument}`);
  }
}
export class UnsubscribeCandlestick extends Unsubscribe {
  marketApi = true;
  constructor(interval: string, instrument: string) {
    super(`candlestick.${interval}.${instrument}`);
  }
}

export class SubscriptionDataCandlestick {
  result: {
    instrument_name: string; // instrument_name
    subscription: string;
    channel: string;
    interval: string;
    data: {
      i: string;
      o: number; // open
      c: number; // close
      h: number; // high
      l: number; // low
      v: number; // volume
      t: number; // start time of the stick, in epochtime
    }[];
  };
}
