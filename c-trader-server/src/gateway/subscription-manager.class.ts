import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { Socket } from 'socket.io';

import { Secured } from '../auth/auth.decorators';

@Secured()
export class SubscriptionManager implements OnGatewayDisconnect {
  private subscriptions: { [key: string]: Subscription } = {};

  handleDisconnect(client: Socket) {
    this.getSubscriptionKeys(client).forEach(this.unsubscribe.bind(this));
  }

  protected getSubscriptionKeys(client: Socket) {
    return [client.id];
  }

  protected subscribe(
    subscription: Subscription,
    client: Socket,
    subKey?: string,
  ) {
    if (subKey) {
      this.subscriptions[subKey] = subscription;
    } else {
      const keys = this.getSubscriptionKeys(client);
      if (keys.length !== 1) throw Error(`Subscription key must be specified`);
      this.subscriptions[keys[0]] = subscription;
    }
  }

  protected unsubscribe(client: Socket, subKey?: string) {
    subKey = subKey || this.getSubscriptionKeys(client)[0];
    if (this.subscriptions[subKey]) {
      this.subscriptions[subKey].unsubscribe();
    }
  }
}
