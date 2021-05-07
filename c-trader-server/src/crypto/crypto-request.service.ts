import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subscriber } from 'rxjs';

import { CryptoRequest } from './types/request.interface';
import { CryptoBaseResponse, CryptoResponse } from './types/response.interface';
import { SubscriptionData } from './types/subscribe';
import { WSService } from './ws.service';

@Injectable()
export class CryptoRequestService {
  private logger = new Logger(CryptoRequestService.name);
  private openRequests: { [key: number]: Subscriber<any> } = {};

  constructor(private wssService: WSService) {
    wssService.message$.subscribe(this.handleMessage.bind(this));
  }

  public makeRequest<T>(request: CryptoRequest<T>): Observable<T> {
    return new Observable((subscriber) => {
      const filled = this.wssService.send(request);
      this.openRequests[filled.id] = subscriber;
      this.handleTimeout(filled.id);
    });
  }

  private handleTimeout(id: number) {
    setTimeout(() => {
      if (this.openRequests[id]) {
        this.logger.error(`Request ${id} timed out ...`);
        this.openRequests[id].complete() 
      }
    }, 60000);
  }

  private handleMessage(response: CryptoBaseResponse | SubscriptionData<any>) {
    if (CryptoResponse.isResponse(response)) {
      this.handleRequest(response);
    }
  }

  private handleRequest(response: CryptoResponse) {
    if (this.openRequests[response.id]) {
      this.openRequests[response.id].next(response);
      this.openRequests[response.id].complete();
      delete this.openRequests[response.id];
    } else {
      this.logger.error(`Response without matching request ${response.id} ...`);
    }
  }
}
