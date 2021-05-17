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
import { Secured } from '../auth/auth.decorators';
@Secured()
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
    this.logger.debug(`Get Balance History for ${body.currency} ...`);

    this.balanceTrackingService
      .getLast(body.currency, body.timespan || 60, body.interval || 1)
      .subscribe((data) => {
        client.emit('get-history-data-' + body.currency, data);
      });
  }

  @SubscribeMessage('get-balance-percentages')
  getBalanceInPercentages(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Get Balance in Percentages for ...`);

    this.balanceTrackingService.getValuePercentagesOfWallet().then((data) => {
      client.emit('get-balance-percentages-data', data);
    });
  }
}
