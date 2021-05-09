import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CryptoService } from 'src/crypto/crypto.service';
import { SubscribeTicker } from 'src/crypto/types/subscriptions/ticker.subscription';
import { TickerRepository } from 'src/entities/repos/ticker.repository';
import { TickerEntity } from 'src/entities/ticker.entity';
import { Between, Repository } from 'typeorm';

import { FifteenMinutesTickerEntity } from './entities/ticker.15m.entity';
import { DayTickerEntity } from './entities/ticker.1d.entity';
import { HourTickerEntity } from './entities/ticker.1h.entity';
import { MinuteTickerEntity } from './entities/ticker.1m.entity';
import { ThrityMinutesTickerEntity } from './entities/ticker.30m.entity';
import { FiveMinutesTickerEntity } from './entities/ticker.5m.entity';

@Injectable()
export class TickerTrackingService {
  private logger = new Logger(TickerTrackingService.name);

  private lastUpdate: {
    [key: string]: {
      '1m'?: number;
      '5m'?: number;
      '15m'?: number;
      '30m'?: number;
      '1h'?: number;
      '1d'?: number;
    };
  } = {};

  private watchedInstruments: Subscription;

  /*
  MinuteTickerEntity,
  FiveMinutesTickerEntity,
  FifteenMinutesTickerEntity,
  HourTickerEntity,
  DayTickerEntity,
  ThrityMinutesTickerEntity,
*/

  constructor(
    private cryptoService: CryptoService,
    private tickerRepo: TickerRepository,
    @InjectRepository(MinuteTickerEntity)
    private minutesTickerRepo: Repository<MinuteTickerEntity>,
    @InjectRepository(FiveMinutesTickerEntity)
    private fiveMinutesTickerRepo: Repository<FiveMinutesTickerEntity>,
    @InjectRepository(FifteenMinutesTickerEntity)
    private fifteenMinutesTickerRepo: Repository<FifteenMinutesTickerEntity>,
    @InjectRepository(ThrityMinutesTickerEntity)
    private thityMinutesTickerRepo: Repository<ThrityMinutesTickerEntity>,
    @InjectRepository(HourTickerEntity)
    private hourTickerRepo: Repository<HourTickerEntity>,
    @InjectRepository(DayTickerEntity)
    private dayTickerRepo: Repository<DayTickerEntity>,
  ) {
    this.watch();
  }

  /*
        '1m'?: number;
      '5m'?: number;
      '15m'?: number;
      '30m'?: number;
      '1h'?: number;
      '1d'?: number;
  */

  getLast(
    instrument: string,
    minutes: number,
    interval: '1m' | '5m' | '15m' | '30m' | '1h' | '1d',
  ): Observable<TickerEntity[]> {
    const now = new Date();
    const past = new Date(new Date().getTime() - minutes * 60 * 1000);

    let repo: Repository<TickerEntity>;
    if (interval == '1m') repo = this.minutesTickerRepo;
    if (interval == '5m') repo = this.fiveMinutesTickerRepo;
    if (interval == '15m') repo = this.fifteenMinutesTickerRepo;
    if (interval == '30m') repo = this.thityMinutesTickerRepo;
    if (interval == '1h') repo = this.hourTickerRepo;
    if (interval == '1d') repo = this.dayTickerRepo;

    return from(
      repo.find({
        where: { instrument, time: Between(past, now) },
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
    this.cryptoService.subscribe(new SubscribeTicker()).subscribe((data) => {
      if (!this.lastUpdate[data.result.instrument_name]) {
        this.lastUpdate[data.result.instrument_name] = {
          '1m': 0,
          '5m': 0,
          '15m': 0,
          '30m': 0,
          '1h': 0,
          '1d': 0,
        };
      }
      const last = this.lastUpdate[data.result.instrument_name];
      const time = new Date().getTime();
      const hasToUpdate = {
        '1m': time - last['1m'] > 60000,
        '5m': time - last['5m'] > 300000,
        '15m': time - last['15m'] > 900000,
        '30m': time - last['30m'] > 1800000,
        '1h': time - last['1h'] > 3600000,
        '1d': time - last['1d'] > 86400000,
      };

      if (
        hasToUpdate['1m'] ||
        hasToUpdate['5m'] ||
        hasToUpdate['15m'] ||
        hasToUpdate['30m'] ||
        hasToUpdate['1h'] ||
        hasToUpdate['1d']
      ) {
        const ticker = data.result.data[0];
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

        if (hasToUpdate['1m']) {
          last['1m'] = time;
          this.minutesTickerRepo.save(entitiy);
        }
        if (hasToUpdate['5m']) {
          last['5m'] = time;
          this.fiveMinutesTickerRepo.save(entitiy);
        }
        if (hasToUpdate['15m']) {
          last['15m'] = time;
          this.fifteenMinutesTickerRepo.save(entitiy);
        }
        if (hasToUpdate['30m']) {
          last['30m'] = time;
          this.thityMinutesTickerRepo.save(entitiy);
        }
        if (hasToUpdate['1h']) {
          last['1h'] = time;
          this.hourTickerRepo.save(entitiy);
        }
        if (hasToUpdate['1d']) {
          last['1d'] = time;
          this.dayTickerRepo.save(entitiy);
        }
      }
    });
  }

  @Cron('0 * * * * *')
  cleanupDatabase() {
    this.logger.debug(`Cleanup Ticker-Database`);
    const deadlineM = new Date(new Date().getTime() - 2592000000);
    const deadlineD = new Date(new Date().getTime() - 86400000);
    const deadline4h = new Date(new Date().getTime() - 14400000);
    const deadlineH = new Date(new Date().getTime() - 3600000);
    this.minutesTickerRepo
      .createQueryBuilder()
      .delete()
      .where('time < :time', { time: deadlineH })
      .execute();
    this.fifteenMinutesTickerRepo
      .createQueryBuilder()
      .delete()
      .where('time < :time', { time: deadline4h })
      .execute();
    this.fifteenMinutesTickerRepo
      .createQueryBuilder()
      .delete()
      .where('time < :time', { time: deadline4h })
      .execute();
    this.thityMinutesTickerRepo
      .createQueryBuilder()
      .delete()
      .where('time < :time', { time: deadlineD })
      .execute();
    this.hourTickerRepo
      .createQueryBuilder()
      .delete()
      .where('time < :time', { time: deadlineM })
      .execute();
  }
}
