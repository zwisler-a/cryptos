import { Module } from '@nestjs/common';
import { CryptoModule } from 'src/crypto/crypto.module';
import { GrowthAnalyticService } from './growth-analytic.service';

@Module({
  imports: [CryptoModule],
  providers: [GrowthAnalyticService],
  exports: [],
})
export class AnalyticsModule {}
