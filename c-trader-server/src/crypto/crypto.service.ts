import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject, Subscriber } from 'rxjs';
import { finalize, share } from 'rxjs/operators';
import { CryptoRequestService } from './crypto-request.service';
import { CryptoSubsbscriptionService } from './crypto-subscription.service';

import { CryptoRequest } from './types/request.interface';
import { CryptoBaseResponse, CryptoResponse } from './types/response.interface';
import { Subscribe, SubscriptionData, Unsubscribe } from './types/subscribe';
import { WSService } from './ws.service';

@Injectable()
export class CryptoService {
  private logger = new Logger(CryptoService.name);

  constructor(
    private request: CryptoRequestService,
    private subscription: CryptoSubsbscriptionService,
  ) {}

  public makeRequest<T>(request: CryptoRequest<T>): Observable<T> {
    return this.request.makeRequest(request);
  }

  public subscribe<T>(to: Subscribe<T>): Observable<SubscriptionData<T>> {
    return this.subscription.subscribe(to);
  }
}
