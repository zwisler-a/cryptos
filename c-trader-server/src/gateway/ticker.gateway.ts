import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { TickerTrackingService } from 'src/data-tracking/ticker-tracking.service';
import { TickerService } from 'src/service/ticker.service';
import { Interval } from 'src/types/interval.type';

@WebSocketGateway({ namespace: 'ticker' })
export class TickerGateway {
  private logger = new Logger(TickerGateway.name);
  private subscriptions: { [key: string]: Subscription } = {};

  @WebSocketServer()
  server: Server;

  constructor(
    private tickerService: TickerService,
    private tickerTrackingService: TickerTrackingService,
  ) {}

  @SubscribeMessage('subscribe')
  subscribeTicker(
    @MessageBody() instrument: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`Subscribe ${client.id} to ${instrument}`);
    this.subscriptions[
      `${client.id}_${instrument}`
    ] = this.tickerService.getTicker(instrument).subscribe((data) => {
      client.emit('data-' + instrument, data.result);
    });
  }
  @SubscribeMessage('unsubscribe')
  unsubscribeTicker(
    @MessageBody() instrument: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`Unsubscribe ${client.id} from ${instrument}`);
    const sub = this.subscriptions[`${client.id}_${instrument}`];
    if (sub) sub.unsubscribe();
  }

  @SubscribeMessage('get-instrument-history')
  subscribePositionPrice(
    @MessageBody()
    body: { instrument: string; timespan: number; interval: Interval },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`Subscribe to Position Price ${body.instrument} - ${body.interval} - ${body.timespan} ...`);
    this.tickerTrackingService
      .getLast(body.instrument, body.timespan || 60, body.interval)
      .subscribe((data) => {
        client.emit('get-instrument-history-data-' + body.instrument, data);
      });
  }
}
