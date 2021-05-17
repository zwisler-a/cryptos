import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { concat } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { Secured } from 'src/auth/auth.decorators';
import { CryptoService } from 'src/crypto/crypto.service';
import { PublicGetCandlestick } from 'src/crypto/types/requests/get-candlestick.rest.public';
import { SubscribeCandlestick } from 'src/crypto/types/subscriptions/candlestick.subscription';

import { SubscriptionManager } from './subscription-manager.class';

@Secured()
@WebSocketGateway({ namespace: 'candlestick' })
export class CandlestickGateway extends SubscriptionManager {
  private logger = new Logger(CandlestickGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private cryptoService: CryptoService) {
    super();
  }

  @SubscribeMessage('subscribe')
  subscribeCandlestick(
    @MessageBody() body: { interval: string; instrument: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(
      `Subscribe ${client.id} to candlestick ${body.interval} - ${body.instrument}`,
    );
    const subKey = `${client.id}_${body.interval}_${body.instrument}`;
    const sub = concat(
      this.cryptoService
        .make(new PublicGetCandlestick(body.instrument, body.interval))
        .pipe(map((res) => res.result)),
      this.cryptoService
        .subscribe(new SubscribeCandlestick(body.interval, body.instrument))
        .pipe(map((res) => res.result)),
    ).subscribe((data) => {
      client.emit(`candlestick-data-${body.instrument}-${body.interval}`, data);
    });
    this.subscribe(sub, client, subKey);
  }

  @SubscribeMessage('unsubscribe')
  unsubscribeCandlestick(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { interval: string; instrument: string },
  ) {
    this.logger.debug(`Unsubscribe ${client.id} from candlestick`);
    const subKey = `${client.id}_${body.interval}_${body.instrument}`;
    this.unsubscribe(client, subKey);
  }
}
