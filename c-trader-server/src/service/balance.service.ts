import { Injectable, Logger } from '@nestjs/common';
import { concat } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoService } from 'src/crypto/crypto.service';
import { PrivateGetAccountSummary } from 'src/crypto/types/requests/get-account-summary.private';
import {
  SubscribeUserBalance,
  SubscriptionDataUserBalance,
} from 'src/crypto/types/subscriptions/user-balance.subscription';
import { BalanceTrackingService } from 'src/data-tracking/balance-tracking.service';
import { BalanceEntitiy } from 'src/entities/balance.entity';

@Injectable()
export class BalanceService {
  private logger = new Logger(BalanceService.name);
  constructor(
    private cryptoService: CryptoService,
    private balanceTracking: BalanceTrackingService,
  ) {}

  getBalanceTotalStream() {
    return this.balanceTracking.updateTotalBalance$;
  }

  getBalanceStream() {
    return concat(this.fetchBalance(), this.getBalanceSubscription());
  }


  private fetchBalance() {
    return this.cryptoService
      .makeRequest(new PrivateGetAccountSummary())
      .pipe(map((data) => data.result.accounts));
  }

  private getBalanceSubscription() {
    return this.cryptoService
      .subscribe<SubscriptionDataUserBalance>(new SubscribeUserBalance())
      .pipe(map((data) => data.result.data));
  }
}
