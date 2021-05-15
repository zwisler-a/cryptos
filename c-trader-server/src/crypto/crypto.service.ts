import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

import { CryptoRequestService } from './crypto-request.service';
import { CryptoRestRequestService } from './crypto-rest.service';
import { CryptoSubsbscriptionService } from './crypto-subscription.service';
import { CryptoRequest } from './types/request.interface';
import {
  CryptoRestRequest,
  CryptoRestResponse,
} from './types/rest-request.interface';
import { Subscribe, SubscriptionData } from './types/subscribe';

@Injectable()
export class CryptoService {
  private logger = new Logger(CryptoService.name);

  constructor(
    private request: CryptoRequestService,
    private subscription: CryptoSubsbscriptionService,
    private rest: CryptoRestRequestService,
  ) {}

  public makeRequest<T>(request: CryptoRequest<T>): Observable<T> {
    return this.request.makeRequest(request);
  }

  public make<T>(
    request: CryptoRestRequest<T>,
  ): Observable<CryptoRestResponse<T>> {
    return this.rest.makeRequest(request);
  }

  public subscribe<T>(to: Subscribe<T>): Observable<SubscriptionData<T>> {
    return this.subscription.subscribe(to);
  }
}
