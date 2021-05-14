import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WsSubscription } from './base/ws-subscription.class';

export interface BalanceData {
  currency: string;
  balance: number;
  available: number;
  order: number;
  stake: number;
}

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private wsSubscription = new WsSubscription<BalanceData[]>('wallet');
  private wsSubBalance = new WsSubscription<BalanceData[]>('balance');
  private currentBalance: BalanceData[] = [];

  constructor() {}

  getBalancePercentages(): Observable<
    { currency: string; percentage: number }[]
  > {
    return new Observable((subscriber) => {
      this.wsSubBalance.once('get-balance-percentages-data', (data) => {
        subscriber.next(data);
        subscriber.complete();
      });
      this.wsSubBalance.send('get-balance-percentages');
    });
  }

  stream(): Observable<BalanceData[]> {
    return this.wsSubscription.data$.pipe(
      map((data) => {
        return (this.currentBalance = this.processNewData(data));
      })
    );
  }

  private processNewData(data: BalanceData[]) {
    return this.currentBalance
      .map((wallet) => {
        const newDataWallet = data.find(
          (newWallet) => newWallet.currency === wallet.currency
        );
        return newDataWallet || wallet;
      })
      .concat(
        ...data.filter(
          (newWallet) =>
            !this.currentBalance.find(
              (exsistingWallet) =>
                exsistingWallet.currency === newWallet.currency
            )
        )
      );
  }
}
