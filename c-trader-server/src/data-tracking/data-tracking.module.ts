import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoModule } from 'src/crypto/crypto.module';
import { PositionEntity } from 'src/entities/position.entity';
import { BalanceRepository } from 'src/entities/repos/balance.repository';
import { TickerRepository } from 'src/entities/repos/ticker.repository';
import { TickerEntity } from 'src/entities/ticker.entity';

import { BalanceTrackingService } from './balance-tracking.service';
import { TickerTrackingService } from './ticker-tracking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BalanceRepository,
      PositionEntity,
      TickerRepository,
      TickerEntity,
    ]),
    CryptoModule,
  ],
  providers: [BalanceTrackingService, TickerTrackingService],
  exports: [BalanceTrackingService, TickerTrackingService],
})
export class DataTrackingModule {}
