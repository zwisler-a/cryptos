import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoModule } from 'src/crypto/crypto.module';
import { PositionEntity } from 'src/entities/position.entity';
import { BalanceRepository } from 'src/entities/repos/balance.repository';
import { TickerRepository } from 'src/entities/repos/ticker.repository';

import { BalanceTrackingService } from './balance-tracking.service';
import { FifteenMinutesTickerEntity } from './entities/ticker.15m.entity';
import { DayTickerEntity } from './entities/ticker.1d.entity';
import { HourTickerEntity } from './entities/ticker.1h.entity';
import { MinuteTickerEntity } from './entities/ticker.1m.entity';
import { ThrityMinutesTickerEntity } from './entities/ticker.30m.entity';
import { FiveMinutesTickerEntity } from './entities/ticker.5m.entity';
import { OrderTrackingService } from './order-tracking.service';
import { TickerTrackingService } from './ticker-tracking.service';

export const tickerEntities = [
  MinuteTickerEntity,
  FiveMinutesTickerEntity,
  FifteenMinutesTickerEntity,
  HourTickerEntity,
  DayTickerEntity,
  ThrityMinutesTickerEntity,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BalanceRepository,
      PositionEntity,
      TickerRepository,
      ...tickerEntities
    ]),
    CryptoModule,
  ],
  providers: [BalanceTrackingService, TickerTrackingService, OrderTrackingService],
  exports: [BalanceTrackingService, TickerTrackingService, OrderTrackingService],
})
export class DataTrackingModule {}
