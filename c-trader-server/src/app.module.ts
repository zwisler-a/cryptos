import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard, JwtStrategy } from './auth/jwt.strategy';
import { LocalAuthGuard, LocalStrategy } from './auth/local.strategy';
import { CryptoModule } from './crypto/crypto.module';
import {
  DataTrackingModule,
  tickerEntities,
} from './data-tracking/data-tracking.module';
import { BalanceEntitiy } from './entities/balance.entity';
import { PositionEntity } from './entities/position.entity';
import { PositionRepository } from './entities/repos/position.repository';
import { TickerEntity } from './entities/ticker.entity';
import { CandlestickGateway } from './gateway/candlestick.gateway';
import { InstrumentGateway } from './gateway/instrument.gateway';
import { OrderGateway } from './gateway/order.gateway';
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
    ConfigModule.forRoot({ envFilePath: '.env' }),
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
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'shhh',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [
    TickerGateway,
    BalanceGateway,
    InstrumentGateway,
    OrderGateway,
    TradesGateway,
    PositionGateway,
    CandlestickGateway,
    PositionService,
    BalanceService,
    TickerService,
    TotalBalanceGateway,

    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AppModule {}
