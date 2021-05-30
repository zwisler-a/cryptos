import { Injectable } from '@angular/core';
import { WsSubscription } from 'src/app/services/base/ws-subscription.class';

export interface LogEntry {
  timestamp: number;
  level: number;
  context: string;
  message: string;
  trace?: string;
}

@Injectable()
export class LoggingService {
  private wsSubscription = new WsSubscription<LogEntry>('log');
  get stream$() {
    return this.wsSubscription.data$;
  }
}
