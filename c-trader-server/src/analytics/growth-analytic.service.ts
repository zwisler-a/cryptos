import { Injectable } from '@nestjs/common';
import { CryptoService } from 'src/crypto/crypto.service';
import { SubscribeTicker } from 'src/crypto/types/subscriptions/ticker.subscription';

@Injectable()
export class GrowthAnalyticService {
  constructor(private cryptoService: CryptoService) {}

  watch() {
  }
}
