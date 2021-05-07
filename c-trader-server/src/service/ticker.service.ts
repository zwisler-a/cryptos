import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize, share } from 'rxjs/operators';
import { CryptoService } from 'src/crypto/crypto.service';
import {
  SubscribeTicker,
  UnsubscribeTicker,
} from 'src/crypto/types/subscriptions/ticker.subscription';

@Injectable()
export class TickerService {
  private logger = new Logger(TickerService.name);
  constructor(private cryptoService: CryptoService) {}

  getTicker(instrument: string) {
    return this.cryptoService.subscribe(new SubscribeTicker(instrument));
  }
}
