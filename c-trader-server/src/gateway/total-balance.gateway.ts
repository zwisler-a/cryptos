import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BalanceTrackingService } from 'src/data-tracking/balance-tracking.service';
import { BalanceService } from 'src/service/balance.service';

import { SubscriptionManager } from './subscription-manager.class';

@WebSocketGateway({ namespace: 'balance' })
export class TotalBalanceGateway extends SubscriptionManager {
  private logger = new Logger(TotalBalanceGateway.name);

  constructor(
    private balanceService: BalanceService,
    private balanceTrackingService: BalanceTrackingService,
  ) {
    super();
  }

  @SubscribeMessage('subscribe')
  subscribeTicker(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Subscribe ${client.id} to account balance total`);
    const sub = this.balanceService
      .getBalanceTotalStream()
      .subscribe((data) => {
        client.emit(`data`, data);
      });
    this.subscribe(sub, client);
  }

  @SubscribeMessage('unsubscribe')
  unsubscribeTicker(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Unsubscribe ${client.id} from account balance`);
    this.unsubscribe(client);
  }

  @SubscribeMessage('get-history')
  subscribePositionPrice(
    @MessageBody()
    body: { currency: string; timespan: number; interval: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`Subscribe Balance Currency ${body.currency} ...`);

    this.balanceTrackingService
      .getLastXMinutes(body.currency, body.timespan || 60)
      .pipe(
        this.balanceTrackingService.filterForIntervalPipe(body.interval || 1),
      )
      .subscribe((data) => {
        client.emit('get-history-data-' + body.currency, data);
      });
  }
}
