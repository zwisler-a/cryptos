import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { debounce, debounceTime, finalize, share } from 'rxjs/operators';

import { CryptoRequestService } from './crypto-request.service';
import { CryptoBaseResponse } from './types/response.interface';
import { Subscribe, SubscriptionData, Unsubscribe } from './types/subscribe';
import { WSService } from './ws.service';

interface SubscriptionPair {
  s: Subject<any>;
  o: Observable<any>;
}

@Injectable()
export class CryptoSubsbscriptionService {
  private logger = new Logger(CryptoSubsbscriptionService.name);
  private subscriptionMonitor$ = new Subject();
  private initiatedSubscriptions: Subscribe<any>[] = [];
  private subscriptions: {
    [key: string]: SubscriptionPair;
  } = {};

  constructor(
    private wssService: WSService,
    private requestService: CryptoRequestService,
  ) {
    this.wssService.message$.subscribe(this.handleMessage.bind(this));
    this.wssService.reconnect$.subscribe(this.handleReconnect.bind(this));
    this.subscriptionMonitor$
      .pipe(debounceTime(60000 * 5))
      .subscribe(this.handleReconnect.bind(this));
  }

  public subscribe<T>(to: Subscribe<T>): Observable<SubscriptionData<T>> {
    const channel = to.params.channels[0];
    if (!this.subscriptions[channel]) {
      this.requestService
        .makeRequest(to)
        .subscribe({ error: () => this.cleanupChannel(channel) });
      this.subscriptions[channel] = this.createSubscriptionPair(channel, to);
      this.initiatedSubscriptions.push(to);
    }
    return this.subscriptions[channel].o;
  }

  private handleReconnect() {
    this.initiatedSubscriptions.forEach((subscription) => {
      this.logger.debug(`Resubscribe to ${subscription.params.channels[0]}`);
      this.requestService.makeRequest(subscription).subscribe();
    });
  }

  private handleMessage(response: CryptoBaseResponse | SubscriptionData<any>) {
    if (SubscriptionData.isSubscription(response)) {
      this.handleSubscription(response);
      this.subscriptionMonitor$.next();
    }
  }

  private handleSubscription(response: SubscriptionData<any>) {
    const subscription = response.result.subscription;
    const channel = response.result.channel;
    if (this.subscriptions[channel]) {
      this.subscriptions[channel].s.next(response);
    }
    if (this.subscriptions[subscription]) {
      this.subscriptions[subscription].s.next(response);
    }
    if (!this.subscriptions[channel]) {
      this.logger.debug(`Creating Channel "${channel}" ...`);
      this.subscriptions[channel] = this.createSubscriptionPair(
        subscription,
        null,
      );
    }
    if (!this.subscriptions[subscription]) {
      this.logger.debug(`Creating Subscription "${subscription}" ...`);
      this.subscriptions[subscription] = this.createSubscriptionPair(
        subscription,
        null,
      );
    }
  }

  private createSubscriptionPair(
    channel: string,
    subscribe: Subscribe<any>,
  ): SubscriptionPair {
    const s = new Subject<any>();
    if (subscribe) {
      const o = s.pipe(
        finalize(() => {
          this.logger.debug(`Unsubscribe from ${channel}.`);
          this.requestService
            .makeRequest(Unsubscribe.from(subscribe))
            .subscribe(() => this.cleanupChannel(channel));
        }),
        share(),
      );
      return { s, o };
    } else {
      return { s, o: s.pipe(share()) };
    }
  }

  private cleanupChannel(channel: string) {
    if (!this.subscriptions[channel]) return;
    this.subscriptions[channel].s.complete();
    this.subscriptions[channel] = null;
    this.initiatedSubscriptions = this.initiatedSubscriptions.filter(
      (sub) => sub.params.channels[0] === channel,
    );
  }
}
