import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PositionService } from 'src/service/position.service';

@WebSocketGateway({ namespace: 'position' })
export class PositionGateway {
  private logger = new Logger(PositionGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private positionService: PositionService
  ) {}

  @SubscribeMessage('create')
  async createPosition(
    @MessageBody() body: { instrument: string; side: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`Create Position on ${body.instrument} ...`);
    this.positionService.createPosition(body.instrument, body.side);
  }

  @SubscribeMessage('buy-in')
  async buyInPosition(
    @MessageBody() body: { id: string; price: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.positionService.buyIn(body.id, body.price).subscribe();
  }

  @SubscribeMessage('close')
  async sellOutPosition(
    @MessageBody() body: { id: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`Sell Out Position ...`);
    this.positionService.closePosition(body.id);
  }

  @SubscribeMessage('subscribe')
  subscribePosition(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`Subscribe to Position ...`);
    this.positionService.position$.subscribe((positions) => {
      client.emit('data', positions);
    });
  }

}
