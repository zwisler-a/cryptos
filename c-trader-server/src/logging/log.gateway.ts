import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SubscriptionManager } from 'src/gateway/subscription-manager.class';

import { CustomLogger } from './custom-logger';

@WebSocketGateway({ namespace: 'log' })
export class LogGateway extends SubscriptionManager {
  constructor(private logger: CustomLogger) {
    super();
  }

  @SubscribeMessage('subscribe')
  subscribeLog(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { level: number },
  ) {
    const sub = this.logger.logStream$.subscribe((log) => {
      client.emit('data', log);
    });
    this.subscribe(sub, client);
  }

  @SubscribeMessage('unsubscribe')
  unsubscribeLog(@ConnectedSocket() client: Socket) {
    this.unsubscribe(client);
  }
}
