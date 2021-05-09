import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { first, map, mergeMap, shareReplay } from 'rxjs/operators';
import { CryptoService } from 'src/crypto/crypto.service';
import { PrivateGetAccountSummary } from 'src/crypto/types/requests/get-account-summary.private';
import { PublicGetInstuments } from 'src/crypto/types/requests/get-instruments.public';
import { SubscribeTicker } from 'src/crypto/types/subscriptions/ticker.subscription';
import { BalanceEntitiy } from 'src/entities/balance.entity';
import { BalanceRepository } from 'src/entities/repos/balance.repository';

@Injectable()
export class BalanceTrackingService {
  private logger = new Logger(BalanceTrackingService.name);
  private instruments$ = this.cryptoService
    .makeRequest(new PublicGetInstuments())
    .pipe(shareReplay(1));

  private _updateTotalBalance$ = new Subject<any>();
  updateTotalBalance$ = this._updateTotalBalance$.asObservable();

  constructor(
    private cryptoService: CryptoService,
    private balanceRepo: BalanceRepository,
    
  ) {}


  getLast(
    currency: string,
    minutes: number,
    interval: number,
  ): Observable<BalanceEntitiy[]> {
    const past = new Date(new Date().getTime() - minutes * 60 * 1000);
    const query = this.balanceRepo
      .createQueryBuilder()
      .select()
      .where('currency = :currency AND timestamp > :past', { currency, past })
      .groupBy(
        `FLOOR(TIMESTAMPDIFF(Second, '2010-01-01 00:00:00', timestamp) / ${interval})`,
      )
      .orderBy(`timestamp`, 'ASC');
    return from(query.getMany());
  }

  @Cron('3 * * * * *')
  cleanupDatabase() {
    this.logger.debug(`Cleanup Balance-Database`);
    const deadline = new Date(new Date().getTime() - 1000 * 60 * 60 * 24);
    this.balanceRepo
      .createQueryBuilder()
      .delete()
      .where('timestamp < :time AND currency != :excludedCurrency', {
        time: deadline,
        excludedCurrency: 'USDT_TOTAL',
      })
      .execute();
  }

  @Cron('30 * * * * *')
  private snapshotBalance() {
    this.logger.debug(`Collecting Wallet information ...`);
    this.cryptoService
      .makeRequest(new PrivateGetAccountSummary())
      .subscribe((res) => {
        const entities$ = res.result.accounts
          .filter((account) => account.balance)
          .map((account) => {
            return this.convertToBtc(account.currency, account.balance).pipe(
              map((balanceInBtc) => {
                const accountBalance = new BalanceEntitiy();
                accountBalance.currency = account.currency;
                accountBalance.value = account.balance;
                accountBalance.value_in_usdt = balanceInBtc;
                return accountBalance;
              }),
            );
          });

        forkJoin(entities$).subscribe(async (entities) => {
          const totalUsdt = entities.reduce(
            (acc, cur) => (acc += cur.value_in_usdt),
            0,
          );
          const totalBalance = new BalanceEntitiy();
          totalBalance.currency = 'USDT_TOTAL';
          totalBalance.value = totalUsdt;
          totalBalance.value_in_usdt = totalUsdt;
          const totalBalanceSaved = await this.balanceRepo.save(totalBalance);
          await this.balanceRepo.save(entities);
          this._updateTotalBalance$.next(totalBalanceSaved);
        });
      });
  }

  private convertToBtc(currency: string, value: number) {
    return this.findExchangePairBtc(currency).pipe(
      this.mapExchangeValueBtc(value),
    );
  }

  private mapExchangeValueBtc(value: number) {
    return mergeMap<any, Observable<number>>((instrument) => {
      if (!instrument) return of(value);
      return this.cryptoService
        .subscribe(new SubscribeTicker(instrument.instrument_name))
        .pipe(
          first(),
          map((res) => {
            const latestTrade = res.result.data[0].a;
            return value * latestTrade;
          }),
        );
    });
  }

  private findExchangePairBtc(currency: string) {
    return this.instruments$.pipe(
      first(),
      map((data) => {
        const instruments = data.result.instruments;
        const instrument = instruments.find(
          (instrument) =>
            instrument.base_currency === currency &&
            instrument.quote_currency === 'USDT',
        );
        return instrument;
      }),
    );
  }
}
