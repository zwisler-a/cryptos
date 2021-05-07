import { Logger } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CryptoService } from 'src/crypto/crypto.service';
import { PrivateGetTrades } from 'src/crypto/types/requests/get-trades.private';
import { SubscribeUserTrades, SubscriptionDataUserTrades } from 'src/crypto/types/subscriptions/user-trade.subscription';

@WebSocketGateway({ namespace: 'trades' })
export class TradesGateway {
  private logger = new Logger(TradesGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private cryptoService: CryptoService) {}

  @SubscribeMessage('subscribe')
  subscribeTrades(@ConnectedSocket() client: Socket) {
    this.cryptoService.makeRequest(new PrivateGetTrades()).subscribe((data) => {
      client.emit('trades-data', data.result.trade_list);
    });
    this.cryptoService
      .subscribe<SubscriptionDataUserTrades>(new SubscribeUserTrades())
      .subscribe((data) => {
        client.emit('trades-data', data.result.data);
      });
  }
}
