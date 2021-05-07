import { Subscribe } from '../subscribe';

export class SubscribeUserTrades extends Subscribe<SubscriptionDataUserTrades> {
  constructor(instrument?: string) {
    super(instrument ? `user.trade.${instrument}` : 'user.trade');
  }
}

export class SubscriptionDataUserTrades  {
    data: {
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
}
