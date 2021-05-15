import { HttpModule, Module } from '@nestjs/common';
import { CryptoRequestService } from './crypto-request.service';
import { CryptoRestRequestService } from './crypto-rest.service';
import { CryptoSubsbscriptionService } from './crypto-subscription.service';
import { CryptoService } from './crypto.service';
import { SignService } from './sign.service';
import { WSService } from './ws.service';

@Module({
  imports: [HttpModule],
  providers: [WSService, SignService, CryptoService, CryptoRequestService, CryptoSubsbscriptionService, CryptoRestRequestService],
  exports: [CryptoService]
})
export class CryptoModule {}
