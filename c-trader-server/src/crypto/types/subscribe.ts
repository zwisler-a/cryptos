import { CryptoRequest } from './request.interface';
import { CryptoBaseResponse, CryptoResponse } from './response.interface';

export class Subscribe<T> extends CryptoRequest<any> {
  method = 'subscribe';
  params: { channels: string[] } = { channels: [] };
  data?: T;
  constructor(channel: string) {
    super();
    this.params.channels = [channel];
  }
}

export class Unsubscribe extends CryptoRequest<any> {
  method = 'unsubscribe';
  params: { channels: string[] } = { channels: [] };
  constructor(channels: string) {
    super();
    this.params.channels = [channels];
  }
  static from(subscribe: Subscribe<any>) {
    const unsub = new Unsubscribe(subscribe.params.channels[0]);
    unsub.marketApi = subscribe.marketApi;
    return unsub;
  }
}

export class SubscriptionData<T> extends CryptoBaseResponse {
  method = 'subscribe';
  result: { subscription: string; channel: string } & T;

  static isSubscription(
    res: SubscriptionData<any> | CryptoBaseResponse | any,
  ): res is SubscriptionData<any> {
    const possibleSub = res as SubscriptionData<any>;
    const possibleRes = res as CryptoResponse;
    return (
      (possibleRes.id === undefined || possibleRes.id === -1) &&
      possibleSub.method === 'subscribe'
    );
  }
}
