import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { CryptoService } from 'src/crypto/crypto.service';
import { SubscribeCandlestick } from 'src/crypto/types/subscriptions/candlestick.subscription';

@WebSocketGateway({ namespace: 'candlestick' })
export class CandlestickGateway {
  private logger = new Logger(CandlestickGateway.name);

  private subscriptions: { [key: string]: Subscription } = {};

  @WebSocketServer()
  server: Server;

  constructor(private cryptoService: CryptoService) {}

  @SubscribeMessage('subscribe')
  subscribeCandlestick(
    @MessageBody() body: { interval: string; instrument: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(
      `Subscribe ${client.id} to candlestick ${body.interval} - ${body.instrument}`,
    );
    this.subscriptions[client.id] = this.cryptoService
      .subscribe(new SubscribeCandlestick(body.interval, body.instrument))
      .subscribe((data) => {
        client.emit('candlestick-data', data);
      });
  }

  @SubscribeMessage('unsubscribe')
  unsubscribeCandlestick(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Unsubscribe ${client.id} from candlestick`);
    const sub = this.subscriptions[client.id];
    if (sub) sub.unsubscribe();
  }
}
