import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { from, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoService } from 'src/crypto/crypto.service';
import { SubscribeTicker } from 'src/crypto/types/subscriptions/ticker.subscription';
import { TickerRepository } from 'src/entities/repos/ticker.repository';
import { TickerEntity } from 'src/entities/ticker.entity';
import { Between } from 'typeorm/find-options/operator/Between';

@Injectable()
export class TickerTrackingService {
  private logger = new Logger(TickerTrackingService.name);

  private watchedInstruments: Subscription;

  constructor(
    private cryptoService: CryptoService,
    private tickerRepo: TickerRepository,
  ) {
    this.watch();
  }

  getLastXMinutes(instrument: string, minutes: number) {
    const now = new Date();
    const past = new Date(now.getTime() - minutes * 60 * 1000);
    return from(
      this.tickerRepo.find({
        where: { time: Between(past, now), instrument },
        order: { time: 'ASC' },
      }),
    );
  }

  filterForIntervalPipe(intervalInMs: number) {
    return map((data: TickerEntity[]) => {
      let nextTick = 0;
      return data.filter((tick) => {
        const dateInMs = tick.time.getTime();
        if (nextTick < dateInMs) {
          nextTick = dateInMs + intervalInMs;
          return true;
        } else {
          return false;
        }
      });
    });
  }

  unwatch() {
    if (this.watchedInstruments) this.watchedInstruments.unsubscribe();
  }

  watch() {
    let lastTick: TickerEntity = new TickerEntity();
    lastTick.time = new Date();
    this.cryptoService.subscribe(new SubscribeTicker()).subscribe((data) => {
      const ticker = data.result.data[0];
      if (
        Math.floor(ticker.t / 1000) ===
        Math.floor(lastTick.time.getTime() / 1000)
      )
        return;

      const entitiy = new TickerEntity();
      entitiy.trade = ticker.a;
      entitiy.ask = ticker.k;
      entitiy.bid = ticker.b;
      entitiy.change = ticker.c;
      entitiy.high = ticker.h;
      entitiy.instrument = data.result.instrument_name;
      entitiy.last = ticker.l;
      entitiy.time = new Date(ticker.t);
      entitiy.volume = ticker.v;
      this.tickerRepo.save(entitiy);

      lastTick = entitiy;
    });
  }

  @Cron('0 * * * * *')
  cleanupDatabase() {
    this.logger.debug(`Cleanup Ticker-Database`);
    const deadline = new Date(new Date().getTime() - 1000 * 60 * 60 * 24);
    this.tickerRepo
      .createQueryBuilder()
      .delete()
      .where('time < :time', { time: deadline })
      .execute();
  }
}
