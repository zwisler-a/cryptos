import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { CryptoModule } from './crypto/crypto.module';
import { DataTrackingModule, tickerEntities } from './data-tracking/data-tracking.module';
import { BalanceEntitiy } from './entities/balance.entity';
import { PositionEntity } from './entities/position.entity';
import { PositionRepository } from './entities/repos/position.repository';
import { TickerEntity } from './entities/ticker.entity';
import { CandlestickGateway } from './gateway/candlestick.gateway';
import { InstrumentGateway } from './gateway/instrument.gateway';
import { PositionGateway } from './gateway/position.gateway';
import { TickerGateway } from './gateway/ticker.gateway';
import { TotalBalanceGateway } from './gateway/total-balance.gateway';
import { TradesGateway } from './gateway/trades.gateway';
import { BalanceGateway } from './gateway/wallet.gateway';
import { BalanceService } from './service/balance.service';
import { PositionService } from './service/position.service';
import { TickerService } from './service/ticker.service';

@Module({
  imports: [
    CryptoModule,
    ConfigModule.forRoot({envFilePath: '.server.env'}),
    DataTrackingModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      entities: [
        PositionEntity,
        BalanceEntitiy,
        TickerEntity,
        ...tickerEntities,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([PositionRepository]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    TickerGateway,
    BalanceGateway,
    InstrumentGateway,
    TradesGateway,
    PositionGateway,
    CandlestickGateway,
    PositionService,
    BalanceService,
    TickerService,
    TotalBalanceGateway,
  ],
})
export class AppModule {}
