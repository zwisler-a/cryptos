import { Logger } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CryptoService } from 'src/crypto/crypto.service';
import { PublicGetInstuments } from 'src/crypto/types/requests/get-instruments.public';
import { Secured } from '../auth/auth.decorators';
@Secured()
@WebSocketGateway({ namespace: 'instrument' })
export class InstrumentGateway {
  private logger = new Logger(InstrumentGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private cryptoService: CryptoService) {}

  @SubscribeMessage('subscribe')
  subscribeTicker(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Subscribe ${client.id} to instruments`);
    this.cryptoService
      .makeRequest(new PublicGetInstuments())
      .subscribe((data) => {
        client.emit('data', data.result.instruments);
      });
  }
}
