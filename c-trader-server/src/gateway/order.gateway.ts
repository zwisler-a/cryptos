import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderTrackingService } from 'src/data-tracking/order-tracking.service';
import { Secured } from '../auth/auth.decorators';
@Secured()
@WebSocketGateway({ namespace: 'order' })
export class OrderGateway {
  private logger = new Logger(OrderGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private orderService: OrderTrackingService) {}

  @SubscribeMessage('get-orders')
  subscribeOrders(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { instrument: string; days: number },
  ) {
    this.logger.debug(
      `Requesting order for ${body.instrument} - ${body.days} days`,
    );
    this.orderService
      .getOrdersFor(body.instrument, body.days)
      .subscribe((data) => {
        client.emit('get-orders-data-' + body.instrument, data);
      });
  }
}
