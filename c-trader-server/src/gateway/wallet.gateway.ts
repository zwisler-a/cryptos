import { Logger } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BalanceService } from 'src/service/balance.service';

import { SubscriptionManager } from './subscription-manager.class';

@WebSocketGateway({ namespace: 'wallet' })
export class BalanceGateway extends SubscriptionManager {
  private logger = new Logger(BalanceGateway.name);

  constructor(private balanceService: BalanceService) {
    super();
  }

  @SubscribeMessage('subscribe')
  subscribeTicker(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Subscribe ${client.id} to account balance`);
    const sub = this.balanceService.getBalanceStream().subscribe((data) => {
      client.emit('data', data);
    });
    this.subscribe(sub, client);
  }

  @SubscribeMessage('unsubscribe')
  unsubscribeTicker(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Unsubscribe ${client.id} from account balance`);
    this.unsubscribe(client);
  }

  // // Wallet total

  // @SubscribeMessage('subscribe-total')
  // subscribeTotal(@ConnectedSocket() client: Socket) {
  //   this.logger.debug(`Subscribe ${client.id} to account balance total`);
  //   this.subscriptions[
  //     `total_${client.id}`
  //   ] = this.balanceService.getBalanceTotalStream().subscribe((data) => {
  //     client.emit(`total-balance-data`, data);
  //   });
  // }

  // @SubscribeMessage('unsubscribe-total')
  // unsubscribeTotal(@ConnectedSocket() client: Socket) {
  //   this.logger.debug(`Unsubscribe ${client.id} from account balance total`);
  //   const sub = this.subscriptions[`total_${client.id}`];
  //   if (sub) sub.unsubscribe();
  // }
}
