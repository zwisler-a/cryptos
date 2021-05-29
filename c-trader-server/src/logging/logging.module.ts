import { Module } from '@nestjs/common';
import { CustomLogger } from './custom-logger';
import { LogGateway } from './log.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [CustomLogger, LogGateway],
  exports: [CustomLogger],
})
export class LoggingModule {}
