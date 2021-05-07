import { Subscribe, SubscriptionData, Unsubscribe } from '../subscribe';

export class SubscribeUserBalance extends Subscribe<SubscriptionDataUserBalance> {
  constructor() {
    super('user.balance');
  }
}

export class UnsubscribeUserBalance extends Unsubscribe {
  constructor() {
    super('user.balance');
  }
}

export class SubscriptionDataUserBalance {
  data: {
    currency: string;
    balance: number;
    available: number;
    order: number;
    stake: number;
  }[];
}
