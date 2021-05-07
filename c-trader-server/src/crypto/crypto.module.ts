import { Module } from '@nestjs/common';
import { CryptoRequestService } from './crypto-request.service';
import { CryptoSubsbscriptionService } from './crypto-subscription.service';
import { CryptoService } from './crypto.service';
import { SignService } from './sign.service';
import { WSService } from './ws.service';

@Module({
  providers: [WSService, SignService, CryptoService, CryptoRequestService, CryptoSubsbscriptionService],
  exports: [CryptoService]
})
export class CryptoModule {}
